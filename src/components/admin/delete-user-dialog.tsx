"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { InternalUser } from "@/lib/types";

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
}: {
  user: InternalUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => api.delete(`/admin/users/${user.id}`),
    onSuccess: () => {
      toast.success("Compte supprimé.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.code === "USER_HAS_HISTORY") {
        toast.error("Impossible : ce compte a un historique d'activité. Désactivez-le plutôt.");
      } else {
        toast.error(error instanceof ApiError ? error.message : "Erreur");
      }
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Supprimer définitivement ce compte ?</DialogTitle>
          <DialogDescription>
            {user.displayName || user.email} — cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <Alert variant="destructive">
          <AlertTitle>Suppression bloquée si le compte a un historique</AlertTitle>
          <AlertDescription>
            Documents traités, décisions, scans effectués... Si c&apos;est le cas, désactivez plutôt le
            compte depuis le menu d&apos;actions.
          </AlertDescription>
        </Alert>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button variant="destructive" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? "Suppression..." : "Supprimer définitivement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
