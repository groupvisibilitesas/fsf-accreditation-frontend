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
import { DOCUMENT_TYPE_LABELS } from "@/lib/labels";
import type { AccreditationCategory, DocumentType } from "@/lib/types";
import { cn } from "cn";

const schema = z.object({
  code: z
    .string()
    .min(2)
    .regex(/^[A-Z0-9_]{2,30}$/, "Majuscules, chiffres ou underscore uniquement"),
  label: z.string().min(2, "Requis"),
  description: z.string().optional(),
  requiredDocumentTypes: z.array(z.custom<DocumentType>()),
});

type FormValues = z.infer<typeof schema>;

const ALL_DOCUMENT_TYPES = Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[];

export function CategoryDialog({ category }: { category?: AccreditationCategory }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = Boolean(category);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        code: category?.code ?? "",
        label: category?.label ?? "",
        description: "",
        requiredDocumentTypes: category?.requiredDocumentTypes ?? [],
      });
    }
  }, [open, category, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? api.patch(`/admin/accreditation-categories/${category!.id}`, values)
        : api.post("/admin/accreditation-categories", values),
    onSuccess: () => {
      toast.success(isEdit ? "Catégorie mise à jour." : "Catégorie créée.");
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      setOpen(false);
    },
    onError: (error) => toast.error(error instanceof ApiError ? error.message : "Erreur"),
  });

  const requiredDocs = watch("requiredDocumentTypes") ?? [];

  function toggleDoc(type: DocumentType) {
    const next = requiredDocs.includes(type)
      ? requiredDocs.filter((d) => d !== type)
      : [...requiredDocs, type];
    setValue("requiredDocumentTypes", next);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button size="sm" variant="outline">
            Modifier
          </Button>
        ) : (
          <Button>
            <Plus /> Nouvelle catégorie
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Modifier la catégorie" : "Nouvelle catégorie d'accréditation"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="code">Code</Label>
            <Input id="code" placeholder="PHOTO" className="font-mono" {...register("code")} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label">Libellé</Label>
            <Input id="label" placeholder="Photographe" {...register("label")} />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label>Justificatifs requis</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_DOCUMENT_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleDoc(type)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs",
                    requiredDocs.includes(type)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {DOCUMENT_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
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
