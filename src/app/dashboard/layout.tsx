import { RequesterShell } from "@/components/layout/requester-shell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <RequesterShell>{children}</RequesterShell>;
}
