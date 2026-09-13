"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { RotateCw, ShieldCheck, Smartphone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Accreditation, AccreditationRequest, Zone } from "@/lib/types";

interface Props {
  request: AccreditationRequest;
  accreditation: Accreditation & { zones?: { zone: Zone }[] };
  qrUrl: string | null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function HolographicBadge({ request, accreditation, qrUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState(false);

  const requester = request.requester;
  const media = requester?.media;
  const zones = accreditation.zones?.map((z) => z.zone.label) ?? [];

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -14, y: px * 18 });
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 });
  }

  function simulateWallet(provider: string) {
    toast.info(`Simulation — export ${provider} Wallet`, {
      description: "Démonstration : l'intégration réelle nécessite un compte développeur Apple/Google.",
    });
  }

  return (
    <div className="mx-auto max-w-sm">
      <div className="perspective-2000">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="transform-style-3d relative aspect-[10/16] cursor-pointer select-none"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
            transition: "transform 0.15s ease-out",
          }}
          onClick={() => setFlipped((f) => !f)}
        >
          {/* Recto */}
          <div className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl">
            <div className="senegal-stripe h-2" />
            <div className="hologram-shimmer pointer-events-none absolute inset-0 opacity-60" />

            <div className="relative flex h-full flex-col p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                  <span aria-hidden>🦁</span> FSF
                </div>
                <ShieldCheck className="size-4 text-primary" />
              </div>

              <div className="mt-4 flex justify-center">
                <div className="flex size-24 items-center justify-center overflow-hidden rounded-xl border-2 border-white/20 bg-muted">
                  <span className="font-display text-3xl text-muted-foreground">
                    {requester?.firstName?.[0]}
                    {requester?.lastName?.[0]}
                  </span>
                </div>
              </div>

              <div className="mt-3 text-center">
                <p className="font-display text-lg font-semibold text-white">
                  {requester?.firstName} {requester?.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{requester?.function}</p>
              </div>

              <div className="mt-3 rounded-lg bg-white/5 px-3 py-2 text-center">
                <p className="text-xs font-medium text-white">{media?.name}</p>
                <p className="font-mono text-[0.65rem] text-primary">
                  {request.categoryRequested?.label ?? request.categoryRequested?.code}
                </p>
              </div>

              <div className="mt-auto flex items-end justify-between gap-3">
                <div className="text-left">
                  <p className="font-mono text-[0.65rem] text-muted-foreground">{accreditation.number}</p>
                  <p className="text-[0.65rem] text-muted-foreground">
                    Valide jusqu&apos;au {formatDate(accreditation.expiresAt)}
                  </p>
                </div>
                {qrUrl && (
                  <div className="rounded-lg bg-white p-1.5">
                    <Image src={qrUrl} alt="QR Code" width={64} height={64} unoptimized />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verso */}
          <div
            className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-slate-900 to-slate-950 p-5 shadow-2xl"
            style={{ transform: "rotateY(180deg)" }}
          >
            <p className="font-display text-sm font-semibold text-white">Zones autorisées</p>
            <ul className="mt-2 space-y-1">
              {zones.length > 0 ? (
                zones.map((z) => (
                  <li key={z} className="rounded-md bg-primary/10 px-2 py-1 text-xs text-primary">
                    {z}
                  </li>
                ))
              ) : (
                <li className="text-xs text-muted-foreground">Aucune zone attribuée</li>
              )}
            </ul>

            <p className="mt-4 font-display text-sm font-semibold text-white">Consignes de sécurité</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[0.7rem] text-muted-foreground">
              <li>Badge personnel, non transmissible.</li>
              <li>À porter visiblement en permanence dans l&apos;enceinte du stade.</li>
              <li>Toute fraude entraîne un retrait immédiat et un signalement à la FSF.</li>
              <li>En cas de perte, contactez immédiatement la Commission Communication.</li>
            </ul>

            <div className="senegal-stripe-v absolute right-0 top-0 h-full w-1.5" />
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Cliquez sur le badge pour voir le {flipped ? "recto" : "verso"}
      </p>

      <div className="mt-4 flex flex-wrap justify-center gap-2 no-print">
        <Button variant="outline" size="sm" onClick={() => setFlipped((f) => !f)}>
          <RotateCw /> Retourner
        </Button>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          <Printer /> Imprimer (A6)
        </Button>
        <Button variant="outline" size="sm" onClick={() => simulateWallet("Apple")}>
          <Smartphone /> Apple Wallet
        </Button>
        <Button variant="outline" size="sm" onClick={() => simulateWallet("Google")}>
          <Smartphone /> Google Wallet
        </Button>
      </div>
    </div>
  );
}
