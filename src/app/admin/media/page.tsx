"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CreateMediaDialog } from "@/components/admin/create-media-dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { MEDIA_TYPE_LABELS } from "@/lib/labels";
import type { BroadcasterTier, Media, MediaStatus, PaginatedResult } from "@/lib/types";

const BROADCASTER_TIERS: BroadcasterTier[] = [
  "HOST_BROADCASTER",
  "CAF_RIGHTS_HOLDER",
  "FIFA_RIGHTS_HOLDER",
  "NON_RIGHTS_HOLDER",
  "WRITTEN_PRESS_ACCREDITED",
];

const STATUS_TONE: Record<MediaStatus, string> = {
  PENDING: "bg-secondary/15 text-secondary",
  VALIDATED: "bg-primary/15 text-primary",
  REJECTED: "bg-destructive/15 text-destructive",
  SUSPENDED: "bg-destructive/15 text-destructive",
};

export default function AdminMediaPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: () => api.get<PaginatedResult<Media>>("/media", { pageSize: 100 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: MediaStatus }) =>
      api.patch(`/admin/media/${id}/status`, { status }),
    onSuccess: () => {
      toast.success("Statut mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  const tierMutation = useMutation({
    mutationFn: ({ id, broadcasterTier }: { id: string; broadcasterTier: BroadcasterTier }) =>
      api.patch(`/admin/media/${id}`, { broadcasterTier }),
    onSuccess: () => {
      toast.success("Tier diffuseur mis à jour.");
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold">Médias & diffuseurs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Validation des organes de presse et statut vis-à-vis des droits de diffusion.
          </p>
        </div>
        <CreateMediaDialog />
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Tier diffuseur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((media) => (
                <TableRow key={media.id}>
                  <TableCell className="font-medium">{media.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {MEDIA_TYPE_LABELS[media.type]}
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${STATUS_TONE[media.status]}`}>{media.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={media.broadcasterTier ?? undefined}
                      onValueChange={(v) =>
                        tierMutation.mutate({ id: media.id, broadcasterTier: v as BroadcasterTier })
                      }
                    >
                      <SelectTrigger className="w-56">
                        <SelectValue placeholder="Non défini" />
                      </SelectTrigger>
                      <SelectContent>
                        {BROADCASTER_TIERS.map((tier) => (
                          <SelectItem key={tier} value={tier}>
                            {tier}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {media.status !== "VALIDATED" && (
                      <button
                        className="text-xs font-medium text-primary hover:underline"
                        onClick={() => statusMutation.mutate({ id: media.id, status: "VALIDATED" })}
                      >
                        Valider
                      </button>
                    )}
                    {media.status !== "SUSPENDED" && (
                      <button
                        className="ml-3 text-xs font-medium text-destructive hover:underline"
                        onClick={() => statusMutation.mutate({ id: media.id, status: "SUSPENDED" })}
                      >
                        Suspendre
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
