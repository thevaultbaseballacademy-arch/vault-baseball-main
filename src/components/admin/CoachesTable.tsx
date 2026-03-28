import { useState } from "react";
import { MoreHorizontal, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Coach } from "@/hooks/useCoachManagement";
import { format } from "date-fns";

interface CoachesTableProps {
  coaches: Coach[];
  onEdit: (coach: Coach) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string) => void;
}

export const CoachesTable = ({ coaches, onEdit, onToggleStatus, onDelete }: CoachesTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [coachToDelete, setCoachToDelete] = useState<Coach | null>(null);

  const handleDeleteClick = (coach: Coach) => {
    setCoachToDelete(coach);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (coachToDelete) {
      onDelete(coachToDelete.id);
      setDeleteDialogOpen(false);
      setCoachToDelete(null);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "VAULTHQ":
        return "default";
      case "OrgAdmin":
        return "secondary";
      case "Director":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Specialties</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[70px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No coaches found. Add your first coach to get started.
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell className="font-medium">{coach.name}</TableCell>
                  <TableCell>{coach.email}</TableCell>
                  <TableCell className="text-muted-foreground">{(coach as any).location || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {((coach as any).specialties as string[] | null)?.map((s: string) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      )) || "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(coach.role)}>
                      {coach.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={coach.status === "Active" ? "default" : "destructive"}
                      className={coach.status === "Active" ? "bg-green-600" : ""}
                    >
                      {coach.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(coach)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(coach.id, coach.status)}>
                          {coach.status === "Active" ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Suspend
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(coach)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coach</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {coachToDelete?.name}? This action cannot be undone
              and will remove all associated certifications and exam attempts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
