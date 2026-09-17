import { Badge } from "@/components/ui/badge";
import type { RequestStatus, RequesterStatus } from "@/lib/types";
import { cn } from "cn";

const CONFIG: Record<RequestStatus, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-muted text-muted-foreground" },
  SUBMITTED: { label: "Soumise", className: "bg-warning/15 text-warning" },
  UNDER_REVIEW: { label: "En examen", className: "bg-warning/15 text-warning" },
  INFO_REQUESTED: { label: "Complément demandé", className: "bg-destructive/15 text-destructive" },
  COMPLETE: { label: "Complète", className: "bg-warning/15 text-warning" },
  PENDING_VALIDATION: { label: "En attente de validation", className: "bg-warning/15 text-warning" },
  VALIDATED: { label: "Validée", className: "bg-primary/15 text-primary" },
  REJECTED: { label: "Refusée", className: "bg-destructive/15 text-destructive" },
  CANCELLED: { label: "Annulée", className: "bg-muted text-muted-foreground" },
  BADGE_GENERATED: { label: "Badge généré", className: "bg-primary/15 text-primary" },
  ACCESS_USED: { label: "Accès utilisé", className: "bg-primary/15 text-primary" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const config = CONFIG[status];
  return <Badge className={cn("border-0", config.className)}>{config.label}</Badge>;
}

const REQUESTER_STATUS_CONFIG: Record<RequesterStatus, { label: string; className: string }> = {
  PENDING: { label: "En attente", className: "bg-warning/15 text-warning" },
  VALIDATED: { label: "Validé", className: "bg-primary/15 text-primary" },
  REJECTED: { label: "Rejeté", className: "bg-destructive/15 text-destructive" },
  SUSPENDED: { label: "Suspendu", className: "bg-destructive/15 text-destructive" },
};

export function RequesterStatusBadge({ status }: { status: RequesterStatus }) {
  const config = REQUESTER_STATUS_CONFIG[status];
  return <Badge className={cn("border-0", config.className)}>{config.label}</Badge>;
}
