import { format } from "date-fns";
import { ExternalLink, CheckCircle, Clock, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CoachPayout, CoachWithPayout } from "@/hooks/useCoachPayouts";

interface PayoutsTableProps {
  payouts: CoachPayout[];
  coaches: CoachWithPayout[];
}

export const PayoutsTable = ({ payouts, coaches }: PayoutsTableProps) => {
  const getCoachName = (coachId: string) => {
    const coach = coaches.find((c) => c.id === coachId);
    return coach?.name || "Unknown Coach";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (payouts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No payouts yet. Send your first payout to a coach above.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Coach</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stripe Transfer</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payouts.map((payout) => (
            <TableRow key={payout.id}>
              <TableCell className="text-muted-foreground">
                {format(new Date(payout.created_at), "MMM d, yyyy h:mm a")}
              </TableCell>
              <TableCell className="font-medium">
                {getCoachName(payout.coach_id)}
              </TableCell>
              <TableCell className="font-mono font-bold text-green-600">
                ${(payout.amount_cents / 100).toFixed(2)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {payout.description || "-"}
              </TableCell>
              <TableCell>{getStatusBadge(payout.status)}</TableCell>
              <TableCell>
                {payout.stripe_transfer_id ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="font-mono text-xs"
                  >
                    <a
                      href={`https://dashboard.stripe.com/transfers/${payout.stripe_transfer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {payout.stripe_transfer_id.slice(0, 12)}...
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  </Button>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
