import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Loader2, DollarSign, Send, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useCoachPayouts, type CoachWithPayout } from "@/hooks/useCoachPayouts";
import { AdminSidebar } from "@/components/admin-analytics/AdminSidebar";
import { PayoutsTable } from "@/components/admin/PayoutsTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AdminPayouts = () => {
  const { user, isAdmin, isLoading: authLoading } = useAdminAuth();
  const { payouts, eligibleCoaches, isLoading, processPayout, updateStripeAccount, getCoachPayoutTotal } = useCoachPayouts();

  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<CoachWithPayout | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [stripeAccountId, setStripeAccountId] = useState("");

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handleOpenPayoutDialog = () => {
    setSelectedCoach(null);
    setAmount("");
    setDescription("");
    setPayoutDialogOpen(true);
  };

  const handleProcessPayout = () => {
    if (!selectedCoach || !amount) return;

    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) return;

    processPayout.mutate(
      {
        coach_id: selectedCoach.id,
        amount_cents: amountCents,
        description: description || undefined,
      },
      {
        onSuccess: () => {
          setPayoutDialogOpen(false);
          setSelectedCoach(null);
          setAmount("");
          setDescription("");
        },
      }
    );
  };

  const handleOpenLinkDialog = (coach: CoachWithPayout) => {
    setSelectedCoach(coach);
    setStripeAccountId(coach.stripe_account_id || "");
    setLinkDialogOpen(true);
  };

  const handleLinkStripeAccount = () => {
    if (!selectedCoach || !stripeAccountId.trim()) return;

    updateStripeAccount.mutate(
      {
        coach_id: selectedCoach.id,
        stripe_account_id: stripeAccountId.trim(),
      },
      {
        onSuccess: () => {
          setLinkDialogOpen(false);
          setSelectedCoach(null);
          setStripeAccountId("");
        },
      }
    );
  };

  const totalPaidOut = payouts?.filter(p => p.status === "completed").reduce((sum, p) => sum + p.amount_cents, 0) || 0;
  const pendingPayouts = payouts?.filter(p => p.status === "pending").length || 0;
  const connectedCoaches = eligibleCoaches?.filter(c => c.stripe_account_id).length || 0;

  const coachesWithStripe = eligibleCoaches?.filter(c => c.stripe_account_id) || [];

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display">Coach Payouts</h1>
              <p className="text-muted-foreground mt-1">
                Manage Partner Referral Fee payouts to coaches
              </p>
            </div>
            <Button onClick={handleOpenPayoutDialog} disabled={coachesWithStripe.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Send Payout
            </Button>
          </div>

          {coachesWithStripe.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Connected Accounts</AlertTitle>
              <AlertDescription>
                No coaches have Stripe accounts linked. Link a Stripe Connect account to a coach before sending payouts.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid Out</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${(totalPaidOut / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{pendingPayouts}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Coaches</CardTitle>
                <LinkIcon className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{connectedCoaches}</div>
                <p className="text-xs text-muted-foreground">
                  of {eligibleCoaches?.length || 0} active coaches
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Coaches & Stripe Accounts</CardTitle>
              <CardDescription>
                Link Stripe Connect accounts to coaches to enable payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {eligibleCoaches?.map((coach) => (
                    <div
                      key={coach.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">{coach.name}</p>
                        <p className="text-sm text-muted-foreground">{coach.email}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {coach.stripe_account_id ? (
                          <>
                            <span className="text-sm text-green-600 font-mono">
                              {coach.stripe_account_id.slice(0, 15)}...
                            </span>
                            <span className="text-sm text-muted-foreground">
                              Total: ${(getCoachPayoutTotal(coach.id) / 100).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">Not connected</span>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenLinkDialog(coach)}
                        >
                          <LinkIcon className="mr-2 h-3 w-3" />
                          {coach.stripe_account_id ? "Update" : "Link"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>
                View all payouts sent to coaches
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <PayoutsTable payouts={payouts || []} coaches={eligibleCoaches || []} />
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Send Payout Dialog */}
      <Dialog open={payoutDialogOpen} onOpenChange={setPayoutDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Send Payout</DialogTitle>
            <DialogDescription>
              Send a Partner Referral Fee payout to a coach via Stripe
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Coach</Label>
              <Select
                value={selectedCoach?.id || ""}
                onValueChange={(value) => {
                  const coach = coachesWithStripe.find((c) => c.id === value);
                  setSelectedCoach(coach || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a coach" />
                </SelectTrigger>
                <SelectContent>
                  {coachesWithStripe.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {coach.name} ({coach.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.50"
                  placeholder="100.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Partner Referral Fee for January 2025"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayout}
              disabled={!selectedCoach || !amount || processPayout.isPending}
            >
              {processPayout.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Send Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Stripe Account Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Link Stripe Account</DialogTitle>
            <DialogDescription>
              Enter the Stripe Connect account ID for {selectedCoach?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stripe_account_id">Stripe Account ID</Label>
              <Input
                id="stripe_account_id"
                placeholder="acct_1234567890"
                value={stripeAccountId}
                onChange={(e) => setStripeAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The coach's Stripe Connect account ID (starts with "acct_")
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleLinkStripeAccount}
              disabled={!stripeAccountId.trim() || updateStripeAccount.isPending}
            >
              {updateStripeAccount.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <LinkIcon className="mr-2 h-4 w-4" />
              )}
              Link Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPayouts;
