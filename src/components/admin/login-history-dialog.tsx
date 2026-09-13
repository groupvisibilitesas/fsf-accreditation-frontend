"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api-client";
import type { InternalUser, LoginAttempt, PaginatedResult } from "@/lib/types";

export function LoginHistoryDialog({
  user,
  open,
  onOpenChange,
}: {
  user: InternalUser;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-login-history", user.id],
    queryFn: () =>
      api.get<PaginatedResult<LoginAttempt>>(`/admin/users/${user.id}/login-history`, { pageSize: 50 }),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Historique de connexion</DialogTitle>
          <DialogDescription>{user.displayName || user.email}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Chargement...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Résultat</TableHead>
                  <TableHead>Adresse IP</TableHead>
                  <TableHead>Appareil</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.items.map((attempt) => (
                  <TableRow key={attempt.id}>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(
                        new Date(attempt.createdAt),
                      )}
                    </TableCell>
                    <TableCell>
                      {attempt.succeeded ? (
                        <Badge className="border-0 bg-primary/15 text-primary">Succès</Badge>
                      ) : (
                        <Badge variant="destructive">{attempt.reason ?? "Échec"}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{attempt.ipAddress ?? "—"}</TableCell>
                    <TableCell className="max-w-56 truncate text-xs text-muted-foreground" title={attempt.userAgent ?? undefined}>
                      {attempt.userAgent ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {data?.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      Aucune tentative enregistrée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
