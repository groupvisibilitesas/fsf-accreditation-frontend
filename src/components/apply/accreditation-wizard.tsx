"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { ArrowLeft, ArrowRight, PartyPopper, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepIndicator } from "@/components/apply/step-indicator";
import { Step1Category } from "@/components/apply/step-1-category";
import { Step2Media } from "@/components/apply/step-2-media";
import { Step3Stadium } from "@/components/apply/step-3-stadium";
import { Step4Documents } from "@/components/apply/step-4-documents";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type {
  AccreditationCategory,
  AccreditationRequest,
  DocumentType,
  Match,
  MediaSummary,
  RequesterProfile,
  RoleInEvent,
  Zone,
} from "@/lib/types";

interface Props {
  match: Match;
  profile: RequesterProfile;
  media: MediaSummary | null;
  categories: AccreditationCategory[];
  zones: Zone[];
}

export function AccreditationWizard({ match, profile, media, categories, zones }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [roleInEvent, setRoleInEvent] = useState<RoleInEvent | null>(null);
  const [preferredZoneIds, setPreferredZoneIds] = useState<string[]>([]);
  const [needsDesk, setNeedsDesk] = useState(false);
  const [needsPower, setNeedsPower] = useState(false);
  const [needsLanWifi, setNeedsLanWifi] = useState(false);
  const [carPlateNumber, setCarPlateNumber] = useState("");
  const [request, setRequest] = useState<AccreditationRequest | null>(null);
  const [uploadedDocTypes, setUploadedDocTypes] = useState<Set<DocumentType>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const selectedCategory = categories.find((c) => c.id === categoryId) ?? null;

  function toggleZone(zoneId: string) {
    setPreferredZoneIds((prev) =>
      prev.includes(zoneId) ? prev.filter((z) => z !== zoneId) : [...prev, zoneId],
    );
  }

  async function syncDraft() {
    if (!categoryId) return null;
    const draft = await api.post<AccreditationRequest>("/requests", {
      matchId: match.id,
      categoryRequestedId: categoryId,
      roleInEvent: roleInEvent ?? undefined,
      needsDesk,
      needsPower,
      needsLanWifi,
      carPlateNumber: carPlateNumber || undefined,
      preferredZoneIds,
    });
    setRequest(draft);
    return draft;
  }

  async function goNext() {
    setSubmitError(null);
    if (step === 3) {
      try {
        setSubmitting(true);
        await syncDraft();
        setStep(4);
      } catch {
        setSubmitError("Impossible d'enregistrer votre brouillon. Réessayez.");
      } finally {
        setSubmitting(false);
      }
      return;
    }
    setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmitRequest() {
    if (!request) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await api.post(`/requests/${request.id}/submit`);
      setSubmitted(true);
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors: ["#10b981", "#f59e0b", "#dc2626"] });
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError("Une erreur est survenue lors de la soumission.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted && request) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel mx-auto max-w-lg rounded-2xl p-8 text-center"
      >
        <PartyPopper className="mx-auto size-12 text-primary" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Demande soumise !</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre dossier est en cours d&apos;examen par la Commission Communication FSF.
        </p>
        <p className="mt-4 rounded-xl border border-primary/30 bg-primary/10 py-3 font-mono text-lg text-primary">
          {request.uniqueReference}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Conservez ce numéro pour suivre votre dossier depuis la page « Suivi de dossier ».
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button asChild className="flex-1">
            <Link href="/dashboard">Voir mon espace</Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link href={`/dashboard/requests/${request.id}`}>Suivre ce dossier</Link>
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator current={step} />

      <div className="glass-panel mt-8 rounded-2xl p-6 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            {step === 1 && (
              <Step1Category
                profile={profile}
                categories={categories}
                categoryId={categoryId}
                roleInEvent={roleInEvent}
                onSelectCategory={setCategoryId}
                onSelectRole={setRoleInEvent}
              />
            )}
            {step === 2 && <Step2Media profile={profile} media={media} />}
            {step === 3 && (
              <Step3Stadium
                zones={zones}
                selectedZoneIds={preferredZoneIds}
                onToggleZone={toggleZone}
                needsDesk={needsDesk}
                needsPower={needsPower}
                needsLanWifi={needsLanWifi}
                carPlateNumber={carPlateNumber}
                onChangeLogistics={(patch) => {
                  if (patch.needsDesk !== undefined) setNeedsDesk(patch.needsDesk);
                  if (patch.needsPower !== undefined) setNeedsPower(patch.needsPower);
                  if (patch.needsLanWifi !== undefined) setNeedsLanWifi(patch.needsLanWifi);
                  if (patch.carPlateNumber !== undefined) setCarPlateNumber(patch.carPlateNumber);
                }}
              />
            )}
            {step === 4 && request && (
              <Step4Documents
                requestId={request.id}
                requiredTypes={selectedCategory?.requiredDocumentTypes ?? []}
                uploaded={uploadedDocTypes}
                onUploaded={(type) => setUploadedDocTypes((prev) => new Set(prev).add(type))}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {submitError && <p className="mt-4 text-sm text-destructive">{submitError}</p>}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-5">
          <Button variant="ghost" onClick={goBack} disabled={step === 1 || submitting}>
            <ArrowLeft /> Précédent
          </Button>

          {step < 4 ? (
            <Button
              onClick={goNext}
              disabled={submitting || (step === 1 && (!categoryId || !roleInEvent))}
            >
              {submitting ? "Enregistrement..." : "Suivant"} <ArrowRight />
            </Button>
          ) : (
            <Button onClick={handleSubmitRequest} disabled={submitting}>
              <Send /> {submitting ? "Envoi..." : "Soumettre ma demande"}
            </Button>
          )}
        </div>
      </div>

      <Button variant="link" className="mt-2" onClick={() => router.push("/")}>
        Annuler et revenir à l&apos;accueil
      </Button>
    </div>
  );
}
