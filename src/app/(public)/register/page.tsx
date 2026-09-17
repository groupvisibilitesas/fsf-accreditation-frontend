"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/layout/brand-mark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { SESSION_QUERY_KEY } from "@/hooks/use-session";
import { publicApi } from "@/lib/api-client";
import type { MediaSummary } from "@/lib/types";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(8, "8 caractères minimum"),
  mediaId: z.string().uuid("Sélectionnez votre organe de presse"),
  firstName: z.string().min(2, "Requis"),
  lastName: z.string().min(2, "Requis"),
  phone: z.string().min(6, "Requis"),
  function: z.string().min(2, "Requis"),
  pressCardNumber: z.string().optional(),
  specialty: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mediaList, setMediaList] = useState<MediaSummary[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    publicApi.get<MediaSummary[]>("/media/public").then(setMediaList).catch(() => setMediaList([]));
  }, []);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      const payload = await response.json();
      if (!response.ok) {
        setServerError(payload.message ?? "Impossible de créer le compte.");
        return;
      }
      queryClient.setQueryData(SESSION_QUERY_KEY, payload.user);
      router.push("/dashboard");
      router.refresh();
    } catch {
      setServerError("Impossible de contacter le serveur.");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="text-center">
          <BrandMark size="lg" className="mx-auto" />
          <h1 className="mt-3 font-display text-2xl font-semibold">Créer mon compte demandeur</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Une seule inscription pour toutes vos demandes d&apos;accréditation FSF.
          </p>
        </div>

        <div className="glass-panel mt-6 overflow-hidden rounded-3xl shadow-xl">
          <div className="senegal-stripe h-1" />
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Adresse email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" {...register("password")} />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mediaId">Organe de presse</Label>
              <Controller
                control={control}
                name="mediaId"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="mediaId" className="w-full">
                      <SelectValue placeholder="Sélectionnez votre média" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaList.map((media) => (
                        <SelectItem key={media.id} value={media.id}>
                          {media.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.mediaId && <p className="text-xs text-destructive">{errors.mediaId.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="function">Fonction</Label>
                <Input id="function" placeholder="Journaliste, photographe..." {...register("function")} />
                {errors.function && <p className="text-xs text-destructive">{errors.function.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="pressCardNumber">N° Carte de presse (CNP)</Label>
                <Input id="pressCardNumber" {...register("pressCardNumber")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="specialty">Spécialité</Label>
                <Input id="specialty" placeholder="Sport, politique..." {...register("specialty")} />
              </div>
            </div>

            {serverError && <p className="text-sm text-destructive">{serverError}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <UserPlus /> {isSubmitting ? "Création..." : "Créer mon compte"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Déjà accrédité ?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
