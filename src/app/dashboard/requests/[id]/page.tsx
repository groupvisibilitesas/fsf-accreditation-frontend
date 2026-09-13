"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { HolographicBadge } from "@/components/badge/holographic-badge";
import { api } from "@/lib/api-client";
import type { Accreditation, AccreditationRequest, Zone } from "@/lib/types";

const BADGE_STATUSES = new Set(["BADGE_GENERATED", "ACCESS_USED"]);

export default function RequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const { data: request, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.get<AccreditationRequest>(`/requests/${id}`),
  });

  const hasBadge = request ? BADGE_STATUSES.has(request.status) : false;

  const { data: accreditation } = useQuery({
    queryKey: ["accreditation", id],
    queryFn: () => api.get<Accreditation & { zones?: { zone: Zone }[] }>(`/requests/${id}/accreditation`),
    enabled: hasBadge,
  });

  const { data: qrData } = useQuery({
    queryKey: ["accreditation-qr", id],
    queryFn: () => api.get<{ url: string }>(`/requests/${id}/accreditation/qr-url`),
    enabled: hasBadge,
  });

  if (isLoading || !request) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/dashboard">
          <ArrowLeft /> Retour à mes demandes
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm text-muted-foreground">{request.uniqueReference}</p>
            <StatusBadge status={request.status} />
          </div>

          <h1 className="mt-2 font-display text-xl font-semibold">
            {request.match?.homeTeam} vs {request.match?.awayTeam}
          </h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {request.match?.kickoffAt && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" />
                {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeStyle: "short" }).format(
                  new Date(request.match.kickoffAt),
                )}
              </span>
            )}
            {request.match?.stadium && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {request.match.stadium}
              </span>
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Catégorie</p>
              <p className="text-sm font-medium">{request.categoryRequested?.label}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Organe de presse</p>
              <p className="text-sm font-medium">{request.requester?.media?.name}</p>
            </div>
          </div>

          {request.decisionReason && (
            <div className="mt-4 rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
              <p className="font-medium">Motif de la décision</p>
              <p className="mt-1">{request.decisionReason}</p>
            </div>
          )}

          {request.complements && request.complements.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium">Compléments demandés</p>
              <ul className="mt-2 space-y-2">
                {request.complements.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border p-3 text-sm text-muted-foreground"
                  >
                    {c.missingItem}
                    {c.resolvedAt && <span className="ml-2 text-primary">— résolu</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          {hasBadge && accreditation ? (
            <HolographicBadge request={request} accreditation={accreditation} qrUrl={qrData?.url ?? null} />
          ) : (
            <div className="glass-panel flex h-full flex-col items-center justify-center rounded-2xl p-8 text-center">
              <p className="font-display text-lg font-semibold">Badge non disponible</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Votre pass média holographique apparaîtra ici dès que la Commission Communication
                FSF aura validé votre dossier.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
