import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Match, MatchQuota } from "@/lib/types";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function MatchCard({ match, quotas }: { match: Match; quotas: MatchQuota[] }) {
  const totalQuota = quotas.reduce((sum, q) => sum + q.quotaTotal, 0);
  const totalConsumed = quotas.reduce((sum, q) => sum + q.consumed, 0);
  const fillRate = totalQuota > 0 ? Math.round((totalConsumed / totalQuota) * 100) : 0;

  return (
    <div className="glass-panel glass-card-hover flex flex-col rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">
            {match.homeTeam} <span className="text-muted-foreground">vs</span> {match.awayTeam}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {formatDate(match.kickoffAt)} · {formatTime(match.kickoffAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" /> {match.stadium}
            </span>
          </div>
        </div>
        <span className="senegal-stripe h-8 w-1.5 shrink-0 rounded-full" aria-hidden />
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Users className="size-3.5" /> Places presse
          </span>
          <span className="font-mono">
            {totalConsumed}/{totalQuota}
          </span>
        </div>
        <Progress value={fillRate} />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {quotas.map((q) => (
            <span
              key={q.categoryId}
              className="rounded-full border border-border bg-muted/50 px-2 py-1 text-[0.7rem] text-muted-foreground"
            >
              {q.category}: {q.remaining} restantes
            </span>
          ))}
        </div>
      </div>

      <Button asChild className="mt-5 w-full">
        <Link href={`/apply/${match.id}`}>Demander une accréditation</Link>
      </Button>
    </div>
  );
}
