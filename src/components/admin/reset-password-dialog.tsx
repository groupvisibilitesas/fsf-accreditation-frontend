"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface FormValues {
  newTemporaryPassword: string;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: InternalUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const mutation = useMutation({
    mutationFn: (values: FormValues) => api.patch(`/admin/users/${user.id}/password`, values),
    onSuccess: () => {
      toast.success("Mot de passe réinitialisé. Sessions actives révoquées.");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      reset();
      onOpenChange(false);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            {user.displayName || user.email} devra utiliser ce nouveau mot de passe temporaire. Toutes ses
            sessions actives seront immédiatement révoquées.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newTemporaryPassword">Nouveau mot de passe temporaire</Label>
            <Input
              id="newTemporaryPassword"
              type="text"
              {...register("newTemporaryPassword", { required: true, minLength: 8 })}
            />
            {errors.newTemporaryPassword && (
              <p className="text-xs text-destructive">8 caractères minimum.</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Réinitialisation..." : "Réinitialiser"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
