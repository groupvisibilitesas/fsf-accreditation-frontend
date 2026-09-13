"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileStack, Newspaper, ShieldCheck, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, publicApi } from "@/lib/api-client";
import type { DashboardGlobalStats, Match, MatchQuotaConfig, PaginatedResult } from "@/lib/types";

export default function AdminDashboardPage() {
  const [selection, setSelection] = useState<string | null>(null);

  const { data: matches } = useQuery({
    queryKey: ["dashboard-matches"],
    queryFn: () => publicApi.get<PaginatedResult<Match>>("/matches", { pageSize: 100 }),
  });

  const defaultMatchId = matches?.items.find((m) => m.status === "OPEN")?.id ?? "ALL";
  const matchId = selection ?? defaultMatchId;

  const selectedMatch = matches?.items.find((m) => m.id === matchId);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard", matchId],
    queryFn: () =>
      api.get<DashboardGlobalStats>("/admin/dashboard", matchId !== "ALL" ? { matchId } : undefined),
  });

  const { data: quotas } = useQuery({
    queryKey: ["admin-match-quotas", matchId],
    queryFn: () => api.get<MatchQuotaConfig[]>(`/admin/matches/${matchId}/quotas`),
    enabled: matchId !== "ALL",
  });

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>;
  }

  const requests = data.requests as unknown as {
    total: number;
    pending: number;
    validated: number;
    rejected: number;
    incomplete: number;
  };
  const referentials = data.referentials as unknown as { media: number; requesters: number };
  const completionRate = data.completionRate as unknown as number;

  const totalConsumed = quotas?.reduce((sum, q) => sum + q.consumed, 0) ?? 0;
  const pressCapacity = selectedMatch?.pressTribuneCapacity ?? null;
  const tribuneFillRate = pressCapacity ? Math.min(100, Math.round((totalConsumed / pressCapacity) * 100)) : 0;

  const cards = [
    { label: "Demandes totales", value: requests.total, icon: FileStack },
    { label: "En cours de traitement", value: requests.pending, icon: FileStack },
    { label: "Validées", value: requests.validated, icon: ShieldCheck },
    { label: "Refusées", value: requests.rejected, icon: FileStack },
    { label: "Médias enregistrés", value: referentials.media, icon: Newspaper },
    { label: "Demandeurs", value: referentials.requesters, icon: Users },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Indicateurs clés de la campagne d&apos;accréditation en cours.
          </p>
        </div>
        <Select value={matchId} onValueChange={setSelection}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Tous les matchs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les matchs</SelectItem>
            {matches?.items.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.homeTeam} vs {m.awayTeam}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="glass-panel rounded-xl p-4">
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <card.icon className="size-4" /> {card.label}
            </p>
            <p className="mt-2 font-display text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">Jauge tribune de presse</p>
          <p className="font-mono text-sm text-muted-foreground">
            {matchId === "ALL"
              ? "Sélectionnez un match"
              : pressCapacity
                ? `${totalConsumed} / ${pressCapacity} pupitres`
                : "Capacité non configurée"}
          </p>
        </div>
        <Progress value={tribuneFillRate} className="mt-4" />
        <p className="mt-2 text-xs text-muted-foreground">
          Taux de validation {matchId === "ALL" ? "global" : "pour ce match"} : {completionRate}%
        </p>
      </div>
    </div>
  );
}
