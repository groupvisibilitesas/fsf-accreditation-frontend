import type { Accreditation, AccreditationRequest } from "@/lib/types";

interface Props {
  request: AccreditationRequest;
  accreditation: Accreditation;
  qrUrl: string | null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(
    new Date(iso),
  );
}

export function PrintBadgeCard({ request, accreditation, qrUrl }: Props) {
  const requester = request.requester;

  return (
    <div className="flex aspect-[10/16] w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground print:break-inside-avoid">
      <div className="senegal-stripe h-1.5" />
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center gap-1 text-[0.6rem] font-semibold uppercase tracking-wide text-primary">
          <span aria-hidden>🦁</span> FSF
        </div>
        <p className="mt-2 text-center font-display text-sm font-semibold">
          {requester?.firstName} {requester?.lastName}
        </p>
        <p className="text-center text-[0.65rem] text-muted-foreground">{requester?.function}</p>
        <p className="mt-2 rounded bg-muted/60 px-2 py-1 text-center text-[0.6rem] font-medium">
          {requester?.media?.name}
        </p>
        <div className="mt-auto flex items-end justify-between gap-2">
          <div>
            <p className="font-mono text-[0.55rem] text-muted-foreground">{accreditation.number}</p>
            <p className="text-[0.55rem] text-muted-foreground">
              Exp. {formatDate(accreditation.expiresAt)}
            </p>
          </div>
          {qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qrUrl} alt="QR" width={40} height={40} className="rounded bg-white p-0.5" />
          )}
        </div>
      </div>
    </div>
  );
}
