import Link from "next/link";
import { notFound } from "next/navigation";
import { backendFetch } from "@/lib/backend-client";
import { getAccessToken } from "@/lib/session";
import { publicServerApi } from "@/lib/server-api";
import { AccreditationWizard } from "@/components/apply/accreditation-wizard";
import { BrandMark } from "@/components/layout/brand-mark";
import type { Match, MediaSummary, RequesterProfile } from "@/lib/types";

export default async function ApplyPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const token = await getAccessToken();

  const [match, categories, zones, profile] = await Promise.all([
    publicServerApi.getMatch(matchId).catch(() => null),
    publicServerApi.listCategories(),
    publicServerApi.listZones(),
    token
      ? backendFetch<RequesterProfile>("/requesters/me", { token }).catch(() => null)
      : Promise.resolve(null),
  ]);

  if (!match || !profile) {
    notFound();
  }

  const mediaList = await publicServerApi.listPublicMedia().catch(() => [] as MediaSummary[]);
  const media = mediaList.find((m) => m.id === profile.mediaId) ?? null;

  const acceptingRequests = match.status === "OPEN";

  return (
    <div className="min-h-screen">
      <div className="senegal-stripe h-1" />
      <header className="glass-header sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
            <BrandMark />
            Accréditation FSF
          </Link>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {(match as Match).homeTeam} vs {(match as Match).awayTeam}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {!acceptingRequests ? (
          <div className="glass-panel mx-auto max-w-lg rounded-3xl p-8 text-center shadow-xl">
            <p className="font-display text-xl font-semibold">Demandes closes</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Ce match n&apos;accepte plus de nouvelles demandes d&apos;accréditation pour le
              moment.
            </p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              Retour aux compétitions ouvertes
            </Link>
          </div>
        ) : (
          <AccreditationWizard
            match={match as Match}
            profile={profile as RequesterProfile}
            media={media}
            categories={categories}
            zones={zones}
          />
        )}
      </main>
    </div>
  );
}
