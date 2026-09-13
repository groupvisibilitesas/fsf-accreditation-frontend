"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { Competition, Match, MatchStatus } from "@/lib/types";

const MATCH_STATUSES: MatchStatus[] = ["DRAFT", "OPEN", "CLOSED", "PLAYED", "CANCELLED", "ARCHIVED"];

const schema = z.object({
  competitionId: z.string().uuid("Sélectionnez une compétition"),
  homeTeam: z.string().min(1, "Requis"),
  awayTeam: z.string().min(1, "Requis"),
  kickoffAt: z.string().min(1, "Requis"),
  stadium: z.string().min(1, "Requis"),
  city: z.string().min(1, "Requis"),
  capacityTotal: z.string().optional(),
  pressTribuneCapacity: z.string().optional(),
  requestsOpenAt: z.string().optional(),
  requestsCloseAt: z.string().optional(),
  rulesNotes: z.string().optional(),
  status: z.custom<MatchStatus>().optional(),
});

type FormValues = z.infer<typeof schema>;

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 16);
}

export function MatchDialog({ match, competitions }: { match?: Match; competitions: Competition[] }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(match);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        competitionId: match?.competitionId ?? "",
        homeTeam: match?.homeTeam ?? "",
        awayTeam: match?.awayTeam ?? "",
        kickoffAt: toDatetimeLocal(match?.kickoffAt),
        stadium: match?.stadium ?? "Stade Abdoulaye Wade",
        city: match?.city ?? "Diamniadio",
        capacityTotal: match?.capacityTotal?.toString() ?? "",
        pressTribuneCapacity: match?.pressTribuneCapacity?.toString() ?? "",
        requestsOpenAt: toDatetimeLocal(match?.requestsOpenAt),
        requestsCloseAt: toDatetimeLocal(match?.requestsCloseAt),
        rulesNotes: match?.rulesNotes ?? "",
        status: match?.status,
      });
    }
  }, [open, match, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        kickoffAt: values.kickoffAt ? new Date(values.kickoffAt).toISOString() : undefined,
        requestsOpenAt: values.requestsOpenAt ? new Date(values.requestsOpenAt).toISOString() : undefined,
        requestsCloseAt: values.requestsCloseAt ? new Date(values.requestsCloseAt).toISOString() : undefined,
        capacityTotal: values.capacityTotal ? Number(values.capacityTotal) : undefined,
        pressTribuneCapacity: values.pressTribuneCapacity ? Number(values.pressTribuneCapacity) : undefined,
      };
      return isEdit ? api.patch(`/admin/matches/${match!.id}`, payload) : api.post("/admin/matches", payload);
    },
    onSuccess: () => {
      toast.success(isEdit ? "Match mis à jour." : "Match créé.");
      queryClient.invalidateQueries({ queryKey: ["admin-matches"] });
      setOpen(false);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm" variant="outline">
            Modifier
          </Button>
        ) : (
          <Button>
            <Plus /> Nouveau match
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier le match" : "Nouveau match"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Compétition</Label>
            <Controller
              control={control}
              name="competitionId"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {competitions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.season})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.competitionId && <p className="text-xs text-destructive">{errors.competitionId.message}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="homeTeam">Équipe à domicile</Label>
              <Input id="homeTeam" {...register("homeTeam")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="awayTeam">Équipe visiteuse</Label>
              <Input id="awayTeam" {...register("awayTeam")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="kickoffAt">Coup d&apos;envoi</Label>
            <Input id="kickoffAt" type="datetime-local" {...register("kickoffAt")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stadium">Stade</Label>
              <Input id="stadium" {...register("stadium")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Ville</Label>
              <Input id="city" {...register("city")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="capacityTotal">Capacité totale du stade</Label>
              <Input id="capacityTotal" type="number" min={0} {...register("capacityTotal")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pressTribuneCapacity">Pupitres tribune presse</Label>
              <Input id="pressTribuneCapacity" type="number" min={0} {...register("pressTribuneCapacity")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="requestsOpenAt">Ouverture des demandes</Label>
              <Input id="requestsOpenAt" type="datetime-local" {...register("requestsOpenAt")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requestsCloseAt">Clôture des demandes</Label>
              <Input id="requestsCloseAt" type="datetime-local" {...register("requestsCloseAt")} />
            </div>
          </div>

          {isEdit && (
            <div className="space-y-1.5">
              <Label>Statut</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MATCH_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="rulesNotes">Règles spécifiques à ce match</Label>
            <Textarea
              id="rulesNotes"
              rows={3}
              placeholder="Consignes particulières, restrictions d'accès, contraintes de sécurité..."
              {...register("rulesNotes")}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
