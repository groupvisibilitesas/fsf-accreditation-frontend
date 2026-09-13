"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog";
import { DeleteUserDialog } from "@/components/admin/delete-user-dialog";
import { LoginHistoryDialog } from "@/components/admin/login-history-dialog";
import type { InternalUser, UserStatus } from "@/lib/types";

export function UserRowActions({ user }: { user: InternalUser }) {
  const { user: currentUser } = useSession();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const isSelf = currentUser?.id === user.id;

  const statusMutation = useMutation({
    mutationFn: (status: UserStatus) => api.patch(`/admin/users/${user.id}/status`, { status }),
    onSuccess: () => {
      toast.success("Statut mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>Modifier rôle / nom</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setHistoryOpen(true)}>Historique de connexion</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setResetOpen(true)}>
            Réinitialiser le mot de passe
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.status !== "ACTIVE" && (
            <DropdownMenuItem onSelect={() => statusMutation.mutate("ACTIVE")}>Activer</DropdownMenuItem>
          )}
          {user.status !== "SUSPENDED" && !isSelf && (
            <DropdownMenuItem onSelect={() => statusMutation.mutate("SUSPENDED")}>
              Suspendre
            </DropdownMenuItem>
          )}
          {user.status !== "INACTIVE" && !isSelf && (
            <DropdownMenuItem onSelect={() => statusMutation.mutate("INACTIVE")}>
              Désactiver
            </DropdownMenuItem>
          )}
          {isSelf && (
            <DropdownMenuItem disabled>Impossible de modifier son propre statut</DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={isSelf} onSelect={() => setDeleteOpen(true)}>
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditUserDialog user={user} open={editOpen} onOpenChange={setEditOpen} />
      <ResetPasswordDialog user={user} open={resetOpen} onOpenChange={setResetOpen} />
      <DeleteUserDialog user={user} open={deleteOpen} onOpenChange={setDeleteOpen} />
      <LoginHistoryDialog user={user} open={historyOpen} onOpenChange={setHistoryOpen} />
    </>
  );
}
