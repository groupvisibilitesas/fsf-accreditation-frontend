"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ComplementDialog } from "@/components/admin/complement-dialog";
import { DecideDialog } from "@/components/admin/decide-dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { AccreditationRequest, RequestStatus } from "@/lib/types";

function useTransition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, toStatus }: { id: string; toStatus: RequestStatus }) =>
      api.patch(`/admin/requests/${id}/status`, { toStatus }),
    onSuccess: () => {
      toast.success("Statut mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });
}

export function RequestRowActions({ request }: { request: AccreditationRequest }) {
  const [decideOpen, setDecideOpen] = useState(false);
  const transition = useTransition();

  switch (request.status) {
    case "SUBMITTED":
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={transition.isPending}
          onClick={() => transition.mutate({ id: request.id, toStatus: "UNDER_REVIEW" })}
        >
          Passer en examen
        </Button>
      );
    case "UNDER_REVIEW":
      return (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            size="sm"
            variant="outline"
            disabled={transition.isPending}
            onClick={() => transition.mutate({ id: request.id, toStatus: "COMPLETE" })}
          >
            Marquer complet
          </Button>
          <ComplementDialog requestId={request.id} />
          <Button size="sm" variant="ghost" onClick={() => setDecideOpen(true)}>
            Refuser
          </Button>
          <DecideDialog request={request} open={decideOpen} onOpenChange={setDecideOpen} />
        </div>
      );
    case "INFO_REQUESTED":
      return (
        <Button
          size="sm"
          variant="outline"
          disabled={transition.isPending}
          onClick={() => transition.mutate({ id: request.id, toStatus: "UNDER_REVIEW" })}
        >
          Remettre en examen
        </Button>
      );
    case "COMPLETE":
    case "PENDING_VALIDATION":
      return (
        <>
          <Button size="sm" onClick={() => setDecideOpen(true)}>
            Décider
          </Button>
          <DecideDialog request={request} open={decideOpen} onOpenChange={setDecideOpen} />
        </>
      );
    default:
      return <span className="text-xs text-muted-foreground">—</span>;
  }
}
