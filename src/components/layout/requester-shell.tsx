"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Menu, Newspaper, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession, useLogout } from "@/hooks/use-session";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/layout/brand-mark";

const NAV = [
  { href: "/dashboard", label: "Mes demandes", icon: LayoutDashboard },
  { href: "/", label: "Compétitions", icon: FileText },
];

export function RequesterShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const logout = useLogout();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = user?.requesterProfileId
    ? [...NAV, { href: "/media-desk", label: "Rédaction", icon: Newspaper }]
    : NAV;

  return (
    <div className="min-h-screen">
      <div className="senegal-stripe h-1" />
      <header className="glass-header sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
            <BrandMark />
            <span className="hidden sm:inline">Espace journaliste</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  pathname === item.href && "bg-accent text-foreground",
                )}
              >
                <item.icon className="size-4" /> {item.label}
              </Link>
            ))}
            <Button size="sm" variant="outline" onClick={() => logout()}>
              Déconnexion
            </Button>
          </nav>
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
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                      pathname === item.href && "bg-accent text-foreground",
                    )}
                  >
                    <item.icon className="size-4" /> {item.label}
                  </Link>
                ))}
                <div className="mt-2 border-t border-border pt-3">
                  <Button size="sm" variant="outline" onClick={() => logout()}>
                    Déconnexion
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
