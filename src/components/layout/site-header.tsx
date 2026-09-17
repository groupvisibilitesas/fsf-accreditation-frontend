"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";
import { useSession, useLogout } from "@/hooks/use-session";
import { cn } from "cn";

const NAV_LINKS = [
  { href: "/", label: "Compétitions" },
  { href: "/track", label: "Suivi de dossier" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useSession();
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const dashboardHref =
    user?.kind === "STAFF"
      ? user.role === "AGENT_CONTROLE"
        ? "/scanner"
        : "/admin"
      : "/dashboard";

  return (
    <header className="sticky top-0 z-50">
      <div className="senegal-stripe h-1" />
      <div className="glass-header">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight">
            <BrandMark />
            <span className="hidden sm:inline">
              Accréditation <span className="text-primary">FSF</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg bg-accent"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? null : isAuthenticated ? (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href={dashboardHref}>
                    <ShieldCheck className="mr-1" /> {user?.displayName || user?.email}
                  </Link>
                </Button>
                <Button size="sm" variant="outline" onClick={() => logout()}>
                  Déconnexion
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/register">Créer un compte</Link>
                </Button>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 text-foreground md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <nav className="flex flex-col gap-1 px-4 pt-2 pb-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
                  {isAuthenticated ? (
                    <>
                      <Button asChild variant="outline" size="sm">
                        <Link href={dashboardHref}>Mon espace</Link>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => logout()}>
                        Déconnexion
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/login">Connexion</Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href="/register">Créer un compte</Link>
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
