"use client";

import { useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { RotateCw, ShieldCheck, Smartphone, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";
import type { Accreditation, AccreditationRequest, RoleInEvent, Zone } from "@/lib/types";

interface Props {
  request: AccreditationRequest;
  accreditation: Accreditation & { zones?: { zone: Zone }[] };
  qrUrl: string | null;
}

const ROLE_LABELS: Record<RoleInEvent, string> = {
  JOURNALISTE_REPORTER: "Journaliste reporter",
  PHOTOGRAPHE: "Photographe",
  CAMERAMAN: "Cameraman",
  COMMENTATEUR: "Commentateur",
  TECHNICIEN_REGIE: "Technicien régie",
};

const ZONE_TONES = ["bg-primary/15 text-primary", "bg-warning/15 text-warning", "bg-accent text-accent-foreground"];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

function Perforation({ dark }: { dark?: boolean }) {
  return (
    <div className="flex justify-center pt-3">
      <span
        className={
          "rounded-full border border-dashed px-3 py-0.5 text-[0.55rem] font-medium uppercase tracking-widest " +
          (dark ? "border-white/25 text-white/50" : "border-border text-muted-foreground")
        }
      >
        Perforation
      </span>
    </div>
  );
}

function RectoFace({ request, accreditation, qrUrl }: Props) {
  const requester = request.requester;
  const media = requester?.media;
  const match = request.match;
  const zones = accreditation.zones?.map((z) => z.zone) ?? [];
  const roleLabel = request.roleInEvent ? ROLE_LABELS[request.roleInEvent] : requester?.function;
  const sig = accreditation.cryptoSignature;
  const signatureCode = (sig?.offlineChecksum ?? accreditation.number).slice(0, 14).toUpperCase();

  const competitionLine = match?.competition
    ? `${match.competition.name}${match.competition.season ? " — " + match.competition.season : ""}`
    : "Accréditation officielle FSF";
  const teamsLine = match ? `${match.homeTeam} vs ${match.awayTeam}` : "";
  const venueLine = match ? `${match.stadium} — ${match.city} • ${formatDate(match.kickoffAt)}` : "";

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-white to-muted/60 text-foreground">
      <div className="hologram-shimmer pointer-events-none absolute inset-0 opacity-15" />
      <div className="senegal-stripe h-1.5" />
      <Perforation />

      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <div className="leading-tight">
              <p className="text-[0.65rem] font-bold uppercase tracking-wide">Fédération Sénégalaise de Football</p>
              <p className="text-[0.55rem] text-muted-foreground">Direction de la Communication</p>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className="inline-block rounded-full bg-foreground px-2.5 py-1 text-[0.55rem] font-bold uppercase tracking-wide text-background">
              Pass média
            </span>
            <p className="mt-1 font-mono text-[0.55rem] text-muted-foreground">{accreditation.number}</p>
          </div>
        </div>

        <div className="border-t border-border" />

        {match && (
          <div className="rounded-xl bg-foreground px-3 py-2.5 text-background">
            <p className="text-[0.6rem] font-semibold uppercase tracking-wide text-secondary">{competitionLine}</p>
            <p className="mt-0.5 text-xs font-semibold">{teamsLine}</p>
            <p className="text-[0.6rem] text-background/70">{venueLine}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-border bg-muted">
            <span className="font-display text-xl text-muted-foreground">
              {requester?.firstName?.[0]}
              {requester?.lastName?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Nom &amp; prénom
            </p>
            <p className="truncate font-display text-base font-bold uppercase leading-tight">
              {requester?.lastName}
            </p>
            <p className="truncate text-sm leading-tight">{requester?.firstName}</p>
          </div>
        </div>

        <div className="rounded-lg bg-muted/70 px-3 py-2">
          <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-muted-foreground">
            Organe de presse
          </p>
          <p className="truncate text-xs font-bold">{media?.name}</p>
          {requester?.pressCardNumber && (
            <p className="font-mono text-[0.6rem] text-muted-foreground">CNP : {requester.pressCardNumber}</p>
          )}
        </div>

        {roleLabel && (
          <div>
            <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Fonction / rôle
            </p>
            <span className="mt-1 inline-block rounded-full bg-foreground px-2.5 py-1 text-[0.6rem] font-bold uppercase text-background">
              {roleLabel}
            </span>
          </div>
        )}

        {zones.length > 0 && (
          <div>
            <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Zones d&apos;accès autorisées
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {zones.map((zone, i) => (
                <span
                  key={zone.id}
                  className={`rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase ${ZONE_TONES[i % ZONE_TONES.length]}`}
                >
                  {zone.code} • {zone.label}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 rounded-lg bg-muted/70 p-2">
          <div className="min-w-0">
            <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-muted-foreground">
              Signature hors-ligne
            </p>
            <p className="truncate font-mono text-[0.65rem] font-bold">{signatureCode}</p>
            <p className="text-[0.55rem] text-muted-foreground">
              Valide jusqu&apos;au {formatDate(accreditation.expiresAt)}
            </p>
          </div>
          {qrUrl && (
            <div className="shrink-0 rounded-lg border border-border bg-white p-1">
              <Image src={qrUrl} alt="QR Code" width={56} height={56} unoptimized />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VersoFace({ accreditation, request }: Props) {
  const zones = accreditation.zones?.map((z) => z.zone) ?? [];
  const match = request.match;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-[#0b1220] to-[#062016] text-white">
      <div className="senegal-stripe h-1.5" />
      <Perforation dark />

      <div className="relative flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="font-display text-sm font-bold text-secondary">
            Règlement intérieur &amp; dispositions média
          </p>
          <p className="text-[0.6rem] text-white/60">
            {match?.stadium ?? "Stade officiel"} • Directives CAF / FIFA / FSF
          </p>
        </div>

        <ul className="space-y-2 text-[0.65rem] leading-snug text-white/85">
          <li>
            <span className="font-semibold text-secondary">Port obligatoire :</span> ce pass officiel doit être
            porté de manière visible autour du cou en permanence dans l&apos;enceinte.
          </li>
          <li>
            <span className="font-semibold text-secondary">Contrôle cryptographique :</span> chaque badge fait
            l&apos;objet d&apos;un scan électronique aux points d&apos;accès. Toute cession à un tiers entraîne
            l&apos;exclusion immédiate.
          </li>
          <li>
            <span className="font-semibold text-secondary">Photographes &amp; cadreurs :</span> le port du gilet
            officiel numéroté délivré par la FSF est obligatoire en bord de terrain.
          </li>
          <li>
            <span className="font-semibold text-secondary">Zone mixte &amp; conférence :</span> les interviews
            d&apos;après-match s&apos;effectuent exclusivement dans les zones dédiées.
          </li>
        </ul>

        {zones.length > 0 && (
          <div className="rounded-lg border border-white/15 bg-white/5 p-2.5">
            <p className="text-[0.55rem] font-semibold uppercase tracking-wide text-white/60">
              Rappel — zones autorisées
            </p>
            <p className="mt-1 text-[0.65rem]">{zones.map((z) => `${z.code} · ${z.label}`).join("  —  ")}</p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-3">
          <div>
            <p className="text-[0.6rem] text-white/60">Pour la FSF —</p>
            <p className="text-xs font-semibold">Commission Communication FSF</p>
            <p className="text-[0.6rem] text-white/60">Dakar, Sénégal</p>
          </div>
          <div className="flex shrink-0 items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-1.5 text-[0.55rem] text-white/70">
            <ShieldCheck className="size-3.5 text-primary" /> Sécurisé — FSF Security Hub
          </div>
        </div>
      </div>
    </div>
  );
}

export function HolographicBadge({ request, accreditation, qrUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [flipped, setFlipped] = useState(false);

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

  function handlePrint() {
    document.body.classList.add("print-isolate-active");
    const cleanup = () => {
      document.body.classList.remove("print-isolate-active");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  function simulateWallet(provider: string) {
    toast.info(`Simulation — export ${provider} Wallet`, {
      description: "Démonstration : l'intégration réelle nécessite un compte développeur Apple/Google.",
    });
  }

  return (
    <div className="print-isolate-root mx-auto max-w-sm">
      {/* Carte interactive (recto/verso au clic) — écran uniquement */}
      <div className="perspective-2000 print:hidden">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="transform-style-3d relative aspect-[105/148] cursor-pointer select-none"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (flipped ? 180 : 0)}deg)`,
            transition: "transform 0.15s ease-out",
          }}
          onClick={() => setFlipped((f) => !f)}
        >
          <div className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-2xl">
            <RectoFace request={request} accreditation={accreditation} qrUrl={qrUrl} />
          </div>
          <div
            className="backface-hidden absolute inset-0 overflow-hidden rounded-2xl border border-border shadow-2xl"
            style={{ transform: "rotateY(180deg)" }}
          >
            <VersoFace request={request} accreditation={accreditation} qrUrl={qrUrl} />
          </div>
        </div>
      </div>

      {/* Faces à plat, format A6 — impression uniquement */}
      <div className="hidden print:block">
        <div className="badge-face">
          <RectoFace request={request} accreditation={accreditation} qrUrl={qrUrl} />
        </div>
        <div className="badge-face">
          <VersoFace request={request} accreditation={accreditation} qrUrl={qrUrl} />
        </div>
      </div>

      <p className="no-print mt-4 text-center text-xs text-muted-foreground">
        Cliquez sur le badge pour voir le {flipped ? "recto" : "verso"}
      </p>

      <div className="no-print mt-4 flex flex-wrap justify-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setFlipped((f) => !f)}>
          <RotateCw /> Retourner
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
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
