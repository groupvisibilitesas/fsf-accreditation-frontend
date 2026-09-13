import { AlertTriangle, CheckCircle2, Clock, ShieldX, XCircle } from "lucide-react";
import { cn } from "cn";
import type { ScanResult } from "@/lib/types";

export interface ScanVerdict {
  result: ScanResult;
  reason?: string;
  accreditation?: {
    requesterName: string;
    mediaName: string;
    categoryLabel: string;
    zones: string[];
    expiresAt: string;
  };
}

const RESULT_CONFIG: Record<
  ScanResult,
  { label: string; tone: string; icon: typeof CheckCircle2 }
> = {
  VALID: { label: "ACCÈS AUTORISÉ", tone: "bg-primary/15 text-primary border-primary/40", icon: CheckCircle2 },
  INVALID: { label: "BADGE INVALIDE", tone: "bg-destructive/15 text-destructive border-destructive/40", icon: XCircle },
  EXPIRED: { label: "BADGE EXPIRÉ", tone: "bg-destructive/15 text-destructive border-destructive/40", icon: Clock },
  REVOKED: { label: "BADGE RÉVOQUÉ", tone: "bg-destructive/15 text-destructive border-destructive/40", icon: ShieldX },
  ALREADY_USED: {
    label: "DÉJÀ UTILISÉ",
    tone: "bg-secondary/15 text-secondary border-secondary/40",
    icon: AlertTriangle,
  },
  OUT_OF_SCOPE: {
    label: "ZONE NON AUTORISÉE",
    tone: "bg-secondary/15 text-secondary border-secondary/40",
    icon: AlertTriangle,
  },
};

export function ScanResultPanel({ verdict }: { verdict: ScanVerdict }) {
  const config = RESULT_CONFIG[verdict.result];
  const Icon = config.icon;

  return (
    <div className={cn("animate-in fade-in rounded-2xl border-2 p-6 text-center", config.tone)}>
      <Icon className="mx-auto size-14" />
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">{config.label}</p>
      {verdict.reason && <p className="mt-1 text-sm opacity-80">{verdict.reason}</p>}

      {verdict.accreditation && (
        <div className="mx-auto mt-5 max-w-sm rounded-xl bg-background/40 p-4 text-left text-foreground">
          <p className="font-display text-lg font-semibold">{verdict.accreditation.requesterName}</p>
          <p className="text-sm text-muted-foreground">
            {verdict.accreditation.mediaName} — {verdict.accreditation.categoryLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {verdict.accreditation.zones.map((zone) => (
              <span key={zone} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                {zone}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Expire le{" "}
            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(
              new Date(verdict.accreditation.expiresAt),
            )}
          </p>
        </div>
      )}
    </div>
  );
}
