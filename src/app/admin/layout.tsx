"use client";

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
} from "lucide-react";
import { useLogout } from "@/hooks/use-session";
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
  { href: "/admin/security", label: "Sécurité crypto", icon: ShieldCheck },
  { href: "/admin/audit", label: "Audit", icon: ScrollText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();

  return (
    <div className="min-h-screen">
      <div className="senegal-stripe h-1" />
      <header className="glass-panel border-x-0 border-t-0">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="text-2xl" aria-hidden>
              🦁
            </span>
            Commission Communication FSF
          </Link>
          <Button size="sm" variant="outline" onClick={() => logout()}>
            Déconnexion
          </Button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3 sm:px-6">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground",
                pathname === item.href && "bg-accent text-foreground",
              )}
            >
              <item.icon className="size-4" /> {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
