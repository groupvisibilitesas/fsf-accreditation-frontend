"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { Competition } from "@/lib/types";

const schema = z.object({
  name: z.string().min(2, "Requis"),
  season: z.string().min(2, "Requis"),
  organizer: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CompetitionDialog({ competition }: { competition?: Competition }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(competition);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        name: competition?.name ?? "",
        season: competition?.season ?? "",
        organizer: competition?.organizer ?? "",
        startDate: competition?.startDate?.slice(0, 10) ?? "",
        endDate: competition?.endDate?.slice(0, 10) ?? "",
        description: competition?.description ?? "",
      });
    }
  }, [open, competition, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? api.patch(`/admin/competitions/${competition!.id}`, values)
        : api.post("/admin/competitions", values),
    onSuccess: () => {
      toast.success(isEdit ? "Compétition mise à jour." : "Compétition créée.");
      queryClient.invalidateQueries({ queryKey: ["admin-competitions"] });
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
            <Plus /> Nouvelle compétition
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la compétition" : "Nouvelle compétition"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom</Label>
              <Input id="name" placeholder="Éliminatoires CAN 2027" {...register("name")} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="season">Saison</Label>
              <Input id="season" placeholder="2026-2027" {...register("season")} />
              {errors.season && <p className="text-xs text-destructive">{errors.season.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="organizer">Organisateur</Label>
            <Input id="organizer" placeholder="CAF" {...register("organizer")} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Début</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">Fin</Label>
              <Input id="endDate" type="date" {...register("endDate")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={3} {...register("description")} />
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
