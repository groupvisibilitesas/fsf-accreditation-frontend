import { Building2, Mail, Phone } from "lucide-react";
import type { MediaSummary, RequesterProfile } from "@/lib/types";
import { MEDIA_TYPE_LABELS } from "@/lib/labels";

export function Step2Media({ profile, media }: { profile: RequesterProfile; media: MediaSummary | null }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card/60 p-5">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{media?.name ?? "Média non renseigné"}</p>
            <p className="text-xs text-muted-foreground">
              {media ? MEDIA_TYPE_LABELS[media.type] : ""} {media ? `· ${media.country}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contact professionnel
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            {profile.professionalPhone || profile.phone}
          </p>
          {profile.professionalEmail && (
            <p className="mt-1 flex items-center gap-2 text-sm">
              <Mail className="size-4 text-muted-foreground" /> {profile.professionalEmail}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Spécialité</p>
          <p className="mt-2 text-sm">{profile.specialty || "Non renseignée"}</p>
        </div>
      </div>

      <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        Ces informations proviennent de votre profil demandeur et de votre organe de presse,
        renseignés à l&apos;inscription. Pour les modifier, contactez la Commission Communication
        FSF ou votre rédacteur en chef.
      </p>
    </div>
  );
}
