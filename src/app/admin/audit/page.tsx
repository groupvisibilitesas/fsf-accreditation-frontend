"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api-client";
import type { PaginatedResult } from "@/lib/types";

interface AuditLog {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  objectType: string;
  objectId: string | null;
  result: string | null;
  reason: string | null;
  createdAt: string;
}

export default function AdminAuditPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: () => api.get<PaginatedResult<AuditLog>>("/admin/audit", { pageSize: 100 }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Journal d&apos;audit</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Traçabilité de toutes les actions sensibles de la plateforme.
      </p>

      <div className="glass-panel mt-4 overflow-x-auto rounded-2xl p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Rôle acteur</TableHead>
                <TableHead>Résultat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "medium" }).format(
                      new Date(log.createdAt),
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.action}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.objectType}
                    {log.objectId && <span className="ml-1 font-mono">#{log.objectId.slice(0, 8)}</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.actorRole ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{log.result ?? "—"}</TableCell>
                </TableRow>
              ))}
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    Aucun évènement enregistré.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
