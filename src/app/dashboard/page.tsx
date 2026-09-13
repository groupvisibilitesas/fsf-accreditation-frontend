"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { api } from "@/lib/api-client";
import type { AccreditationRequest, PaginatedResult } from "@/lib/types";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-requests"],
    queryFn: () => api.get<PaginatedResult<AccreditationRequest>>("/requests", { pageSize: 50 }),
  });

  const requests = data?.items ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Mes demandes d&apos;accréditation</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez l&apos;avancement de vos dossiers et accédez à vos badges.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">
            Nouvelle demande <ArrowRight />
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : requests.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center">
          <FileQuestion className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            Vous n&apos;avez encore déposé aucune demande d&apos;accréditation.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">Voir les matchs ouverts</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              href={`/dashboard/requests/${request.id}`}
              className="glass-panel glass-card-hover flex items-center justify-between gap-4 rounded-xl p-4"
            >
              <div>
                <p className="font-mono text-xs text-muted-foreground">{request.uniqueReference}</p>
                <p className="font-medium">
                  {request.match?.homeTeam} vs {request.match?.awayTeam}
                </p>
                <p className="text-xs text-muted-foreground">{request.categoryRequested?.label}</p>
              </div>
              <StatusBadge status={request.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
