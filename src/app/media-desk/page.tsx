"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Building2, ShieldAlert, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddJournalistDialog } from "@/components/media-desk/add-journalist-dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { EditorDeskRoster } from "@/lib/types";
import { RequesterStatusBadge } from "@/components/dashboard/status-badge";

export default function MediaDeskPage() {
  const { data, isLoading, error } = useQuery<EditorDeskRoster, ApiError>({
    queryKey: ["media-desk-roster"],
    queryFn: () => api.get<EditorDeskRoster>("/media-desk/roster"),
    retry: false,
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  if (error) {
    return (
      <div className="glass-panel mx-auto max-w-lg rounded-2xl p-8 text-center">
        <ShieldAlert className="mx-auto size-10 text-destructive" />
        <p className="mt-3 font-display text-lg font-semibold">Accès réservé</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Cet espace est réservé aux rédacteurs en chef habilités par la FSF. Contactez la
          Commission Communication pour obtenir cette habilitation.
        </p>
        <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          Retour à mon espace
        </Link>
      </div>
    );
  }

  const roster = data!;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Délégation presse</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gérez les correspondants et envoyés spéciaux de votre média.
          </p>
        </div>
        <AddJournalistDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-panel rounded-xl p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="size-4" /> Média
          </p>
          <p className="mt-2 font-display text-lg font-semibold">{roster.media.name}</p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="size-4" /> Correspondants
          </p>
          <p className="mt-2 font-display text-lg font-semibold">{roster.journalists.length}</p>
        </div>
        <div className="glass-panel rounded-xl p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs text-muted-foreground">Demandes par statut</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(roster.requestsByStatus).map(([status, count]) => (
              <Badge key={status} variant="secondary" className="text-xs">
                {status}: {count}
              </Badge>
            ))}
            {Object.keys(roster.requestsByStatus).length === 0 && (
              <span className="text-xs text-muted-foreground">Aucune demande</span>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Fonction</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roster.journalists.map((j) => (
              <TableRow key={j.id}>
                <TableCell className="font-medium">
                  {j.firstName} {j.lastName}
                </TableCell>
                <TableCell className="text-muted-foreground">{j.function}</TableCell>
                <TableCell>
                  <RequesterStatusBadge status={j.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
