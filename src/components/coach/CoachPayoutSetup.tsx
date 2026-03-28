import { useState, useEffect } from "react";
import { Landmark, CheckCircle2, AlertCircle, ExternalLink, Shield, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  coachId: string;
  userId: string;
}

const CoachPayoutSetup = ({ coachId, userId }: Props) => {
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStripeAccount();
  }, [coachId]);

  const loadStripeAccount = async () => {
    try {
      const { data } = await supabase
        .from("coaches")
        .select("stripe_account_id")
        .eq("id", coachId)
        .single();
      if (data?.stripe_account_id) {
        setStripeAccountId(data.stripe_account_id);
      }
    } catch (err) {
      console.error("Error loading stripe account:", err);
    }
    setLoading(false);
  };

  const handleLinkAccount = async () => {
    if (!inputValue.trim() || !inputValue.startsWith("acct_")) {
      toast.error("Please enter a valid Stripe Connect account ID (starts with acct_)");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("coaches")
        .update({ stripe_account_id: inputValue.trim() })
        .eq("id", coachId);

      if (error) throw error;
      setStripeAccountId(inputValue.trim());
      setInputValue("");
      toast.success("Bank account linked successfully! You're now eligible for payouts.");
    } catch (err: any) {
      toast.error(err.message || "Failed to link account");
    }
    setSaving(false);
  };

  if (loading) return null;

  return (
    <div className="space-y-6">
      {/* Payout Status Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">PAYOUT ACCOUNT</h3>
            <p className="text-xs text-muted-foreground">Link your bank for automatic payouts</p>
          </div>
          {stripeAccountId ? (
            <Badge className="ml-auto bg-primary text-primary-foreground">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-auto border-destructive text-destructive">
              <AlertCircle className="w-3 h-3 mr-1" /> Not Connected
            </Badge>
          )}
        </div>

        {stripeAccountId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-secondary/50 rounded-lg p-4">
              <Shield className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Stripe Connect Active</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{stripeAccountId}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-[11px] text-muted-foreground">Revenue Split</p>
                <p className="font-display text-foreground">70 / 30</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <Clock className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-[11px] text-muted-foreground">Payout Schedule</p>
                <p className="font-display text-foreground">Weekly</p>
              </div>
              <div className="bg-secondary/30 rounded-lg p-3 text-center">
                <Landmark className="w-4 h-4 text-accent mx-auto mb-1" />
                <p className="text-[11px] text-muted-foreground">Method</p>
                <p className="font-display text-foreground">Direct Deposit</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-foreground font-medium mb-1">Connect your bank account to get paid</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Vault uses Stripe Connect for secure, automatic payouts. You'll receive 70% of every session booked through the marketplace, deposited directly to your bank account on a weekly basis.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">How to get your Stripe Connect ID:</h4>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal list-inside">
                <li>Create a free Stripe account at <a href="https://connect.stripe.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">stripe.com <ExternalLink className="w-3 h-3" /></a></li>
                <li>Complete the onboarding to verify your identity</li>
                <li>Copy your Account ID (starts with <code className="bg-secondary px-1 rounded text-foreground">acct_</code>)</li>
                <li>Paste it below and click "Link Account"</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="acct_1234567890..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="font-mono text-sm"
              />
              <Button onClick={handleLinkAccount} disabled={saving || !inputValue.trim()}>
                {saving ? "Linking..." : "Link Account"}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payout FAQ */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-display text-sm text-foreground mb-4">PAYOUT FAQ</h3>
        <div className="space-y-3 text-xs">
          <div>
            <p className="font-medium text-foreground">When do I get paid?</p>
            <p className="text-muted-foreground">Payouts are processed weekly every Friday for all completed sessions from the prior week.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">What's the revenue split?</p>
            <p className="text-muted-foreground">You keep 70% of every session. The 30% platform fee covers payment processing, insurance, and platform maintenance.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">How long until funds arrive?</p>
            <p className="text-muted-foreground">Once processed, funds typically arrive in 2-3 business days depending on your bank.</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Is my banking info secure?</p>
            <p className="text-muted-foreground">Absolutely. Vault never sees your bank details — Stripe handles all sensitive financial data with bank-level encryption.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPayoutSetup;
