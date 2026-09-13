"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { AccreditationCategory, Match, MatchQuotaConfig, OverflowPolicy, Zone } from "@/lib/types";
import { cn } from "cn";

const OVERFLOW_POLICIES: OverflowPolicy[] = ["QUEUE", "MANUAL_ARBITRATION", "PRIORITY", "CLOSE"];

interface RowState {
  quotaTotal: string;
  overflowPolicy: OverflowPolicy;
  zoneIds: string[];
}

function CategoryRow({
  match,
  category,
  initial,
  zones,
}: {
  match: Match;
  category: AccreditationCategory;
  initial?: MatchQuotaConfig;
  zones: Zone[];
}) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<RowState>({
    quotaTotal: initial?.quotaTotal.toString() ?? "0",
    overflowPolicy: initial?.overflowPolicy ?? "MANUAL_ARBITRATION",
    zoneIds: initial?.zoneIds ?? [],
  });

  const mutation = useMutation({
    mutationFn: () =>
      api.put(`/admin/matches/${match.id}/quotas`, {
        categoryId: category.id,
        quotaTotal: Number(state.quotaTotal) || 0,
        overflowPolicy: state.overflowPolicy,
        zoneIds: state.zoneIds,
      }),
    onSuccess: () => {
      toast.success(`Quota "${category.label}" enregistré.`);
      queryClient.invalidateQueries({ queryKey: ["admin-match-quotas", match.id] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  function toggleZone(id: string) {
    setState((prev) => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(id) ? prev.zoneIds.filter((z) => z !== id) : [...prev.zoneIds, id],
    }));
  }

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-medium">{category.label}</p>
          <p className="font-mono text-xs text-muted-foreground">{category.code}</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Quota</Label>
            <Input
              type="number"
              min={0}
              className="w-24"
              value={state.quotaTotal}
              onChange={(e) => setState((s) => ({ ...s, quotaTotal: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Politique de dépassement</Label>
            <Select
              value={state.overflowPolicy}
              onValueChange={(v) => setState((s) => ({ ...s, overflowPolicy: v as OverflowPolicy }))}
            >
              <SelectTrigger className="w-52">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OVERFLOW_POLICIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Save /> {mutation.isPending ? "..." : "Enregistrer"}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {zones.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onClick={() => toggleZone(zone.id)}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs",
              state.zoneIds.includes(zone.id)
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            {zone.label}
          </button>
        ))}
      </div>

      {initial && (
        <p className="mt-2 text-xs text-muted-foreground">
          {initial.consumed} / {initial.quotaTotal} places consommées
        </p>
      )}
    </div>
  );
}

export function MatchQuotaDialog({ match }: { match: Match }) {
  const [open, setOpen] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ["accreditation-categories"],
    queryFn: () => api.get<AccreditationCategory[]>("/accreditation-categories", { activeOnly: true }),
    enabled: open,
  });

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => api.get<Zone[]>("/zones", { activeOnly: true }),
    enabled: open,
  });

  const { data: quotas, isLoading } = useQuery({
    queryKey: ["admin-match-quotas", match.id],
    queryFn: () => api.get<MatchQuotaConfig[]>(`/admin/matches/${match.id}/quotas`),
    enabled: open,
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <Settings2 /> Quotas & zones
      </Button>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Quotas — {match.homeTeam} vs {match.awayTeam}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !categories || !zones ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <CategoryRow
                key={category.id}
                match={match}
                category={category}
                initial={quotas?.find((q) => q.categoryId === category.id)}
                zones={zones}
              />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
