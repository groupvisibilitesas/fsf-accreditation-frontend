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
import type { Zone } from "@/lib/types";

const schema = z.object({
  code: z
    .string()
    .min(2)
    .regex(/^[A-Z0-9_]{2,30}$/, "Majuscules, chiffres ou underscore uniquement"),
  label: z.string().min(2, "Requis"),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ZoneDialog({ zone }: { zone?: Zone }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(zone);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({ code: zone?.code ?? "", label: zone?.label ?? "", description: zone?.description ?? "" });
    }
  }, [open, zone, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit ? api.patch(`/admin/zones/${zone!.id}`, values) : api.post("/admin/zones", values),
    onSuccess: () => {
      toast.success(isEdit ? "Zone mise à jour." : "Zone créée.");
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
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
            <Plus /> Nouvelle zone
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la zone" : "Nouvelle zone d'accès"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" placeholder="TRIBUNE_PRESSE" className="font-mono" {...register("code")} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label">Libellé</Label>
            <Input id="label" placeholder="Tribune presse" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
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
