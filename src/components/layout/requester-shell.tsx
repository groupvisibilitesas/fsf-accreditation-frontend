"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Newspaper } from "lucide-react";
import { useSession, useLogout } from "@/hooks/use-session";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/dashboard", label: "Mes demandes", icon: LayoutDashboard },
  { href: "/", label: "Compétitions", icon: FileText },
];

export function RequesterShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const logout = useLogout();
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="senegal-stripe h-1" />
      <header className="glass-panel border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="text-2xl" aria-hidden>
              🦁
            </span>
            Espace journaliste
          </Link>
          <nav className="flex items-center gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                  pathname === item.href && "bg-accent text-foreground",
                )}
              >
                <item.icon className="size-4" /> {item.label}
              </Link>
            ))}
            {user?.requesterProfileId && (
              <Link
                href="/media-desk"
                className={cn(
                  "hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground sm:flex",
                  pathname === "/media-desk" && "bg-accent text-foreground",
                )}
              >
                <Newspaper className="size-4" /> Rédaction
              </Link>
            )}
            <Button size="sm" variant="outline" onClick={() => logout()}>
              Déconnexion
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
