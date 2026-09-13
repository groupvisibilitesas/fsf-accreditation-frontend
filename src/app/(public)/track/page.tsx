"use client";

import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, CheckCircle2, XCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { publicApi } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";

interface TrackResult {
  uniqueReference: string;
  status: string;
  match: { homeTeam: string; awayTeam: string; kickoffAt: string; stadium: string };
  category: string;
  submittedAt: string | null;
  decisionAt: string | null;
  decisionReason: string | null;
  hasAccreditation: boolean;
}

const STATUS_LABELS: Record<string, { label: string; tone: "pending" | "ok" | "ko" }> = {
  DRAFT: { label: "Brouillon (non soumis)", tone: "pending" },
  SUBMITTED: { label: "Soumise — en attente de traitement", tone: "pending" },
  UNDER_REVIEW: { label: "En cours d'examen", tone: "pending" },
  INFO_REQUESTED: { label: "Complément demandé", tone: "pending" },
  COMPLETE: { label: "Dossier complet — en attente de décision", tone: "pending" },
  PENDING_VALIDATION: { label: "En attente de validation finale", tone: "pending" },
  VALIDATED: { label: "Validée", tone: "ok" },
  REJECTED: { label: "Refusée", tone: "ko" },
  CANCELLED: { label: "Annulée", tone: "ko" },
  BADGE_GENERATED: { label: "Badge généré", tone: "ok" },
  ACCESS_USED: { label: "Accès utilisé (jour de match)", tone: "ok" },
};

export default function TrackPage() {
  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await publicApi.get<TrackResult>("/requests/track", { reference, email });
      setResult(data);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Aucun dossier ne correspond à ce numéro et à cet email.");
      } else {
        setError("Une erreur est survenue. Réessayez dans un instant.");
      }
    } finally {
      setLoading(false);
    }
  }

  const status = result ? STATUS_LABELS[result.status] : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">Suivi de dossier</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Saisissez votre numéro de dossier (ex. FSF-2026-841140) ainsi que l&apos;adresse email de
          votre compte demandeur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel mt-8 space-y-4 rounded-2xl p-6">
        <div className="space-y-1.5">
          <Label htmlFor="reference">Numéro de dossier</Label>
          <Input
            id="reference"
            placeholder="FSF-2026-841140"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Adresse email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@media.sn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          <Search /> {loading ? "Recherche..." : "Suivre mon dossier"}
        </Button>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>

      <AnimatePresence>
        {result && status && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel mt-6 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3">
              {status.tone === "ok" && <CheckCircle2 className="size-8 text-primary" />}
              {status.tone === "ko" && <XCircle className="size-8 text-destructive" />}
              {status.tone === "pending" && <Clock className="size-8 text-secondary" />}
              <div>
                <p className="font-mono text-xs text-muted-foreground">{result.uniqueReference}</p>
                <p className="font-display text-lg font-semibold">{status.label}</p>
              </div>
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <p className="flex items-center gap-2 text-muted-foreground">
                <FileText className="size-4" />
                {result.match.homeTeam} vs {result.match.awayTeam} — {result.category}
              </p>
              <p className="text-muted-foreground">{result.match.stadium}</p>
              {result.decisionReason && (
                <p className="rounded-lg bg-destructive/10 p-3 text-destructive">
                  Motif : {result.decisionReason}
                </p>
              )}
              {result.hasAccreditation && (
                <p className="rounded-lg bg-primary/10 p-3 text-primary">
                  Votre pass média est disponible dans votre espace journaliste.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
