"use client";

import { useRef, useState, type MouseEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Radio, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/types";

function formatKickoff(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function Hero({ featuredMatch }: { featuredMatch: Match | null }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -10, y: px * 14 });
  }

  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(600px circle at 20% 0%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(500px circle at 90% 20%, rgba(245,158,11,0.14), transparent 55%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:items-center md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Radio className="size-3.5" /> Accréditations médias — Saison en cours
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Le portail officiel d&apos;accréditation de la{" "}
            <span className="text-primary">Fédération Sénégalaise de Football</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Déposez votre demande d&apos;accréditation presse en ligne, choisissez vos zones sur le
            stade en 3D, et recevez votre pass média holographique sécurisé.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#matchs">
                Voir les matchs ouverts <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/track">
                <Search /> Suivre mon dossier
              </Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="perspective-1000"
        >
          <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="glass-panel glass-card-hover transform-style-3d relative overflow-hidden rounded-3xl p-6 transition-transform duration-200 ease-out"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            <div className="hologram-shimmer absolute inset-0 -z-10 animate-pulse opacity-30" />
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              {featuredMatch ? "Prochain match à accréditer" : "Aucun match ouvert pour le moment"}
            </p>
            {featuredMatch ? (
              <>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted font-display text-2xl">
                      🇸🇳
                    </div>
                    <p className="mt-2 text-sm font-medium">{featuredMatch.homeTeam}</p>
                  </div>
                  <span className="font-display text-2xl text-muted-foreground">vs</span>
                  <div className="text-center">
                    <div className="flex size-16 items-center justify-center rounded-2xl bg-muted font-display text-2xl">
                      🏆
                    </div>
                    <p className="mt-2 text-sm font-medium">{featuredMatch.awayTeam}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-1 border-t border-border pt-4 text-sm">
                  <p className="capitalize text-foreground">{formatKickoff(featuredMatch.kickoffAt)}</p>
                  <p className="text-muted-foreground">
                    {featuredMatch.stadium} — {featuredMatch.city}
                  </p>
                </div>
                <Button asChild className="mt-6 w-full">
                  <Link href={`/apply/${featuredMatch.id}`}>Demander mon accréditation</Link>
                </Button>
              </>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                Revenez bientôt : la Commission Communication FSF ouvrira prochainement de
                nouvelles compétitions aux demandes d&apos;accréditation.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
