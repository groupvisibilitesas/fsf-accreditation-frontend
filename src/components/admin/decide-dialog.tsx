"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { AccreditationRequest, Zone } from "@/lib/types";
import { cn } from "cn";

interface Props {
  request: AccreditationRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DecideDialog({ request, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"validate" | "reject">("validate");
  const [zoneIds, setZoneIds] = useState<string[]>([]);
  const [assignedBoothNumber, setAssignedBoothNumber] = useState("");
  const [assignedFlashSlot, setAssignedFlashSlot] = useState("");
  const [reason, setReason] = useState("");

  const { data: zones } = useQuery({
    queryKey: ["zones"],
    queryFn: () => api.get<Zone[]>("/zones", { activeOnly: true }),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      mode === "validate"
        ? api.post(`/admin/requests/${request.id}/decide`, {
            status: "VALIDATED",
            zoneIds,
            assignedBoothNumber: assignedBoothNumber ? Number(assignedBoothNumber) : undefined,
            assignedFlashSlot: assignedFlashSlot || undefined,
          })
        : api.post(`/admin/requests/${request.id}/decide`, { status: "REJECTED", reason }),
    onSuccess: () => {
      toast.success(mode === "validate" ? "Demande validée, badge généré." : "Demande refusée.");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Une erreur est survenue.");
    },
  });

  function toggleZone(id: string) {
    setZoneIds((prev) => (prev.includes(id) ? prev.filter((z) => z !== id) : [...prev, id]));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Décision — {request.uniqueReference}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            type="button"
            variant={mode === "validate" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("validate")}
          >
            <CheckCircle2 /> Valider
          </Button>
          <Button
            type="button"
            variant={mode === "reject" ? "destructive" : "outline"}
            className="flex-1"
            onClick={() => setMode("reject")}
          >
            <XCircle /> Refuser
          </Button>
        </div>

        {mode === "validate" ? (
          <div className="space-y-4">
            <div>
              <Label>Zones accordées</Label>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                {zones?.map((zone) => (
                  <button
                    key={zone.id}
                    type="button"
                    onClick={() => toggleZone(zone.id)}
                    className={cn(
                      "rounded-lg border px-2.5 py-1.5 text-left text-xs",
                      zoneIds.includes(zone.id)
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {zone.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="booth">Cabine commentateur n°</Label>
                <Input
                  id="booth"
                  type="number"
                  min={1}
                  value={assignedBoothNumber}
                  onChange={(e) => setAssignedBoothNumber(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="flash">Sas flash-interview</Label>
                <Input
                  id="flash"
                  value={assignedFlashSlot}
                  onChange={(e) => setAssignedFlashSlot(e.target.value)}
                  placeholder="Flash Box 1"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="reason">Motif du refus</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </div>
        )}

        <DialogFooter>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || (mode === "validate" ? zoneIds.length === 0 : !reason)}
            variant={mode === "reject" ? "destructive" : "default"}
          >
            {mutation.isPending ? "Traitement..." : mode === "validate" ? "Confirmer la validation" : "Confirmer le refus"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
