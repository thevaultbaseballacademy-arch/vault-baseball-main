import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, CreditCard, Calendar, Loader2, ArrowLeft, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NotificationSettings from "@/components/notifications/NotificationSettings";
import CoachAssignmentRequests from "@/components/athlete/CoachAssignmentRequests";
import MFASettings from "@/components/auth/MFASettings";
import BiometricToggle from "@/components/account/BiometricToggle";
import SessionManagement from "@/components/account/SessionManagement";
import DataExportPanel from "@/components/account/DataExportPanel";
import DataDeletionPanel from "@/components/account/DataDeletionPanel";
import SportSwitcher from "@/components/account/SportSwitcher";

const SUBSCRIPTION_TIERS = {
  basic: {
    price_id: "price_1SjGMKPhXS410TO5XQcZm9fZ",
    product_id: "prod_TgddaadHxz0mTj",
    name: "Basic",
    price: 29,
  },
  performance: {
    price_id: "price_1SjGMYPhXS410TO5bGu1kSSZ",
    product_id: "prod_TgddQA4gp7kWZy",
    name: "Performance",
    price: 59,
  },
  elite: {
    price_id: "price_1SjGMhPhXS410TO59WKiE81b",
    product_id: "prod_Tgdd8gSJpkk33e",
    name: "Elite",
    price: 149,
  },
};

const Account = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState<{
    subscribed: boolean;
    product_id: string | null;
    subscription_end: string | null;
  } | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [managingSubscription, setManagingSubscription] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
      checkSubscription();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      setSubscriptionData(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleManageSubscription = async () => {
    setManagingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open subscription management",
        variant: "destructive",
      });
    } finally {
      setManagingSubscription(false);
    }
  };

  const getCurrentTier = () => {
    if (!subscriptionData?.product_id) return null;
    return Object.values(SUBSCRIPTION_TIERS).find(
      tier => tier.product_id === subscriptionData.product_id
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const currentTier = getCurrentTier();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Profile Section */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-display text-foreground">Account</h1>
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Sport Preference */}
            <SportSwitcher />

            {/* Subscription Section */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-accent" />
                  </div>
                  <h2 className="text-xl font-display text-foreground">Subscription</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={checkSubscription}
                  disabled={checkingSubscription}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${checkingSubscription ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {checkingSubscription && !subscriptionData ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : subscriptionData?.subscribed && currentTier ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                      Active
                    </span>
                    <span className="text-foreground font-medium">{currentTier.name} Plan</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <p className="text-sm text-muted-foreground mb-1">Monthly Price</p>
                      <p className="text-2xl font-display text-foreground">${currentTier.price}/mo</p>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Next Billing Date</p>
                      </div>
                      <p className="text-lg font-medium text-foreground">
                        {formatDate(subscriptionData.subscription_end)}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full md:w-auto"
                    onClick={handleManageSubscription}
                    disabled={managingSubscription}
                  >
                    {managingSubscription ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Manage Subscription
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
                  <Button variant="vault" onClick={() => navigate("/#pricing")}>
                    View Plans
                  </Button>
                </div>
              )}
            </div>

            {/* Privacy Settings Link */}
            <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display text-foreground">Privacy Settings</h2>
                    <p className="text-muted-foreground text-sm">Control who can see your profile content</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate("/privacy-settings")}>
                  Manage
                </Button>
              </div>
            </div>

            {/* Biometric Security */}
            <BiometricToggle />

            {/* Two-Factor Authentication (Admin Only) */}
            <MFASettings userId={user?.id} />

            {/* Session Management */}
            <SessionManagement />

            {/* Data Export (GDPR) */}
            <DataExportPanel />

            {/* Data Deletion (GDPR) */}
            <DataDeletionPanel userId={user?.id} userEmail={user?.email} />

            {/* Coach Assignment Requests */}
            <CoachAssignmentRequests userId={user?.id} />

            {/* Notification Settings */}
            <NotificationSettings userId={user?.id} />
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
