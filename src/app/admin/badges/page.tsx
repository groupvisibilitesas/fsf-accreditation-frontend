"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PrintBadgeCard } from "@/components/admin/print-badge-card";
import { api, publicApi } from "@/lib/api-client";
import type { Accreditation, AccreditationRequest, Match, PaginatedResult } from "@/lib/types";

export default function AdminBadgesPage() {
  const [matchId, setMatchId] = useState<string | null>(null);

  const { data: matches } = useQuery({
    queryKey: ["admin-matches-filter"],
    queryFn: () => publicApi.get<PaginatedResult<Match>>("/matches", { pageSize: 100 }),
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["admin-badges-requests", matchId],
    queryFn: () =>
      api.get<PaginatedResult<AccreditationRequest>>("/admin/requests", {
        matchId: matchId!,
        status: "BADGE_GENERATED",
        pageSize: 100,
      }),
    enabled: !!matchId,
  });

  const { data: badgeData } = useQuery({
    queryKey: ["admin-badges-data", requests?.items.map((r) => r.id).join(",")],
    queryFn: async () => {
      const items = requests!.items;
      const results = await Promise.all(
        items.map(async (request) => {
          const [accreditation, qr] = await Promise.all([
            api.get<Accreditation>(`/admin/accreditations/by-request/${request.id}`),
            api.get<{ url: string }>(`/admin/accreditations/by-request/${request.id}/qr-url`),
          ]);
          return { request, accreditation, qrUrl: qr.url };
        }),
      );
      return results;
    },
    enabled: !!requests && requests.items.length > 0,
  });

  function handlePrint() {
    document.body.classList.add("print-isolate-active");
    const cleanup = () => {
      document.body.classList.remove("print-isolate-active");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
        <div>
          <h1 className="font-display text-2xl font-semibold">Impression des badges (A6)</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Générateur d&apos;impression par lots pour les cartes de presse officielles.
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={matchId ?? undefined} onValueChange={setMatchId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choisir un match" />
            </SelectTrigger>
            <SelectContent>
              {matches?.items.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handlePrint} disabled={!badgeData?.length}>
            <Printer /> Imprimer ({badgeData?.length ?? 0})
          </Button>
        </div>
      </div>

      {!matchId && <p className="text-sm text-muted-foreground">Sélectionnez un match pour lister ses badges générés.</p>}
      {matchId && isLoading && <p className="text-sm text-muted-foreground">Chargement...</p>}
      {matchId && requests?.items.length === 0 && (
        <p className="text-sm text-muted-foreground">Aucun badge généré pour ce match.</p>
      )}

      <div className="print-isolate-root grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-3">
        {badgeData?.map(({ request, accreditation, qrUrl }) => (
          <PrintBadgeCard key={request.id} request={request} accreditation={accreditation} qrUrl={qrUrl} />
        ))}
      </div>
    </div>
  );
}
