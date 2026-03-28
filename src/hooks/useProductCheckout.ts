import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PRODUCT_PRICES, ProductKey } from '@/lib/productPricing';

interface CheckoutError {
  error: string;
  code?: string;
  details?: string;
}

export const useProductCheckout = () => {
  const [loading, setLoading] = useState<ProductKey | null>(null);
  const { toast } = useToast();

  const checkout = async (productKey: ProductKey, successUrl?: string, cancelUrl?: string) => {
    const product = PRODUCT_PRICES[productKey];
    if (!product) {
      toast({
        title: 'Error',
        description: 'Product not found',
        variant: 'destructive',
      });
      return;
    }

    setLoading(productKey);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Determine the endpoint based on payment type
      const endpoint = product.type === 'subscription' ? 'create-checkout' : 'create-payment';
      
      // For subscriptions, user must be authenticated
      if (product.type === 'subscription' && !session) {
        toast({
          title: 'Sign In Required',
          description: 'Please sign in to subscribe to this plan.',
          variant: 'destructive',
        });
        setLoading(null);
        return;
      }
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { 
          priceId: product.price_id,
          successUrl,
          cancelUrl,
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) {
        console.error('Checkout function error:', error);
        throw new Error(error.message || 'Failed to start checkout');
      }
      
      // Handle error responses from edge function
      if (data?.error) {
        const errorData = data as CheckoutError;
        console.error('Checkout error:', errorData);
        
        // Provide user-friendly error messages based on error codes
        let userMessage = errorData.error;
        switch (errorData.code) {
          case 'STRIPE_NOT_CONFIGURED':
          case 'INVALID_KEY_TYPE':
            userMessage = 'Payment system is temporarily unavailable. Please try again later.';
            break;
          case 'AUTH_REQUIRED':
          case 'AUTH_FAILED':
            userMessage = 'Please sign in to continue with your purchase.';
            break;
          case 'PRICE_NOT_AUTHORIZED':
          case 'INVALID_PRICE':
            userMessage = 'This product is currently unavailable. Please contact support.';
            break;
          case 'CHECKOUT_ERROR':
            userMessage = 'Unable to start checkout. Please try again.';
            break;
        }
        
        throw new Error(userMessage);
      }
      
      if (data?.url) {
        // Redirect to Stripe checkout (avoid popup blockers)
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start checkout';
      console.error('Checkout error:', error);
      
      toast({
        title: 'Checkout Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return { checkout, loading };
};
