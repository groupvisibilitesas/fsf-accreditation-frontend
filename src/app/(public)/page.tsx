import { Hero } from "@/components/home/hero";
import { MatchCard } from "@/components/home/match-card";
import { publicServerApi } from "@/lib/server-api";
import type { Match, MatchQuota } from "@/lib/types";

export default async function HomePage() {
  const { items: matches } = await publicServerApi.listOpenMatches().catch(() => ({ items: [] as Match[] }));

  const quotasByMatch = new Map<string, MatchQuota[]>();
  await Promise.all(
    matches.map(async (match) => {
      const quotas = await publicServerApi.listQuotas(match.id).catch(() => []);
      quotasByMatch.set(match.id, quotas);
    }),
  );

  return (
    <>
      <Hero featuredMatch={matches[0] ?? null} />

      <section id="matchs" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Compétitions ouvertes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Éliminatoires CAN, Coupe du Sénégal, Ligue 1 Lonase — quotas par type de média.
            </p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="glass-panel rounded-2xl p-10 text-center text-muted-foreground">
            Aucun match n&apos;accepte de demande d&apos;accréditation pour le moment. Revenez
            prochainement.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} quotas={quotasByMatch.get(match.id) ?? []} />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border bg-card/40">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-3">
          {[
            {
              title: "1. Créez votre dossier",
              body: "Inscrivez-vous avec votre organe de presse, complétez votre profil professionnel une seule fois.",
            },
            {
              title: "2. Choisissez vos zones",
              body: "Sélectionnez vos zones souhaitées sur la carte 3D du Stade Abdoulaye Wade : tribune presse, pelouse, zone mixte…",
            },
            {
              title: "3. Recevez votre pass",
              body: "Après validation de la Commission, téléchargez votre badge holographique avec QR code sécurisé.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <p className="font-display text-lg font-semibold text-primary">{step.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
