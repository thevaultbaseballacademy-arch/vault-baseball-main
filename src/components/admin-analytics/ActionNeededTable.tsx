import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RefreshCw, Lock, Eye } from "lucide-react";
import { CoachWithRisk } from "@/hooks/useCertificationAnalytics";
import { format } from "date-fns";

interface ActionNeededTableProps {
  coaches: CoachWithRisk[];
  isLoading: boolean;
  onAssignRecert: (coachId: string) => void;
  onLockAccess: (coachId: string) => void;
  onViewAttempts: (coachId: string) => void;
}

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "Active":
      return "default";
    case "Expiring":
      return "secondary";
    case "Expired":
    case "Locked":
      return "destructive";
    default:
      return "outline";
  }
};

const getRiskColor = (risk: number) => {
  if (risk <= 20) return "text-green-500";
  if (risk <= 40) return "text-yellow-500";
  return "text-destructive";
};

export const ActionNeededTable = ({
  coaches,
  isLoading,
  onAssignRecert,
  onLockAccess,
  onViewAttempts,
}: ActionNeededTableProps) => {
  // Filter to show only coaches that need action (risk > 0 or have non-active certs)
  const actionNeededCoaches = coaches.filter(
    (c) => c.riskIndex > 0 || c.certifications.some((cert) => cert.status !== "Active")
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Needed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Action Needed</span>
          <Badge variant="outline">{actionNeededCoaches.length} coaches</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actionNeededCoaches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No coaches require immediate action
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coach</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-center">Risk Index</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {actionNeededCoaches.slice(0, 10).map((coach) => {
                  const primaryCert = coach.certifications[0];
                  const nearestExpiration = coach.certifications
                    .filter((c) => c.expiration_date)
                    .sort((a, b) => 
                      new Date(a.expiration_date!).getTime() - new Date(b.expiration_date!).getTime()
                    )[0];

                  return (
                    <TableRow key={coach.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{coach.name}</p>
                          <p className="text-xs text-muted-foreground">{coach.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{coach.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {coach.certifications.length > 0 ? (
                            coach.certifications.map((cert, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {cert.cert_type}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">None</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {primaryCert ? (
                          <Badge variant={getStatusBadgeVariant(primaryCert.status)}>
                            {primaryCert.status}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Cert</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {nearestExpiration?.expiration_date ? (
                          <span className="text-sm">
                            {format(new Date(nearestExpiration.expiration_date), "MMM d, yyyy")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${getRiskColor(coach.riskIndex)}`}>
                          {coach.riskIndex}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAssignRecert(coach.id)}
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Recert
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onLockAccess(coach.id)}
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            Lock
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewAttempts(coach.id)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
