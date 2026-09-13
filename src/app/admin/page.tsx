"use client";

import { useQuery } from "@tanstack/react-query";
import { FileStack, Newspaper, ShieldCheck, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api-client";
import type { DashboardGlobalStats } from "@/lib/types";

const PRESS_TRIBUNE_CAPACITY = 140;

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get<DashboardGlobalStats>("/admin/dashboard"),
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
  const accreditations = data.accreditations as unknown as { generated: number; used: number };
  const referentials = data.referentials as unknown as { media: number; requesters: number };
  const completionRate = data.completionRate as unknown as number;

  const tribuneFillRate = Math.min(100, Math.round((accreditations.generated / PRESS_TRIBUNE_CAPACITY) * 100));

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
      <h1 className="font-display text-2xl font-semibold">Tableau de bord</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Indicateurs clés de la campagne d&apos;accréditation en cours.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {accreditations.generated} / {PRESS_TRIBUNE_CAPACITY} pupitres
          </p>
        </div>
        <Progress value={tribuneFillRate} className="mt-4" />
        <p className="mt-2 text-xs text-muted-foreground">
          Taux de validation global des demandes : {completionRate}%
        </p>
      </div>
    </div>
  );
}
