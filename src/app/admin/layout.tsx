"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileStack,
  Building2,
  Bell,
  ShieldCheck,
  ScrollText,
  IdCard,
  CalendarRange,
  MapPinned,
  Users,
  Menu,
  X,
  LogOut,
  FileDown,
} from "lucide-react";
import { useLogout, useSession } from "@/hooks/use-session";
import { cn } from "cn";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/requests", label: "Demandes", icon: FileStack },
  { href: "/admin/matches", label: "Matchs & quotas", icon: CalendarRange },
  { href: "/admin/config", label: "Zones & catégories", icon: MapPinned },
  { href: "/admin/media", label: "Médias", icon: Building2 },
  { href: "/admin/badges", label: "Impression badges", icon: IdCard },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
  {
    href: "/admin/exports",
    label: "Exports & rapports",
    icon: FileDown,
    permission: "export:data",
  },
  {
    href: "/admin/users",
    label: "Utilisateurs",
    icon: Users,
    permission: "users:manage",
  },
  { href: "/admin/security", label: "Sécurité crypto", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();
  const { user } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Ferme le tiroir mobile a chaque changement de route, sans effet : on
  // ajuste l'etat pendant le rendu (cf. https://react.dev/learn/you-might-not-need-an-effect).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMobileOpen(false);
  }

  const items = NAV.filter((item) => !item.permission || user?.permissions?.includes(item.permission));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Backdrop mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="senegal-stripe h-1 shrink-0" />
        <div className="flex items-center justify-between gap-2 px-5 pt-5 pb-4">
          <Link href="/admin" className="flex items-center gap-2.5 font-display text-base font-semibold">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-lg" aria-hidden>
              🦁
            </span>
            <span className="leading-tight">
              Commission
              <br />
              Communication FSF
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {items.map((item) => {
            const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                  active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                )}
              >
                <item.icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-4 py-4">
          <p className="truncate text-xs font-medium text-sidebar-foreground/90">
            {user?.displayName || user?.email}
          </p>
          <p className="mt-0.5 text-[11px] text-sidebar-foreground/55">
            {user?.role ?? "—"}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 w-full border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            onClick={() => logout()}
          >
            <LogOut /> Déconnexion
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col lg:pl-72">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-foreground/70 hover:bg-muted hover:text-foreground"
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </button>
          <span className="flex items-center gap-2 font-display text-sm font-semibold">
            <span aria-hidden>🦁</span> Commission Communication FSF
          </span>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
