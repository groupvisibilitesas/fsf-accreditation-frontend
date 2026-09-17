import Link from "next/link";
import { BrandMark } from "@/components/layout/brand-mark";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 font-display text-base font-semibold">
            <BrandMark size="sm" />
            Fédération Sénégalaise de Football
          </div>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Portail officiel d&apos;accréditation des médias pour les compétitions organisées ou
            co-organisées par la FSF.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Accréditation</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Matchs ouverts
                </Link>
              </li>
              <li>
                <Link href="/track" className="transition-colors hover:text-foreground">
                  Suivi de dossier
                </Link>
              </li>
              <li>
                <Link href="/register" className="transition-colors hover:text-foreground">
                  Créer un compte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Espaces</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link href="/dashboard" className="transition-colors hover:text-foreground">
                  Journaliste
                </Link>
              </li>
              <li>
                <Link href="/media-desk" className="transition-colors hover:text-foreground">
                  Rédacteur en chef
                </Link>
              </li>
              <li>
                <Link href="/login" className="transition-colors hover:text-foreground">
                  Commission FSF
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="senegal-stripe h-1" />
      <div className="bg-muted/40 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Fédération Sénégalaise de Football — Tous droits réservés.
      </div>
    </footer>
  );
}
