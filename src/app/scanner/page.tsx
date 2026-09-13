"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Keyboard, ScanLine, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QrCameraScanner } from "@/components/scanner/qr-camera-scanner";
import { ScanResultPanel, type ScanVerdict } from "@/components/scanner/scan-result-panel";
import { useLogout } from "@/hooks/use-session";
import { api, publicApi } from "@/lib/api-client";
import { getScannerDeviceId } from "@/lib/scanner-device";
import type { Match, PaginatedResult, Zone } from "@/lib/types";
import { cn } from "cn";

export default function ScannerPage() {
  const logout = useLogout();
  const [matchId, setMatchId] = useState<string | null>(null);
  const [zoneId, setZoneId] = useState<string | "ANY">("ANY");
  const [gate, setGate] = useState("Porte Media 1 (Diamniadio Nord)");
  const [mode, setMode] = useState<"camera" | "manual">("camera");
  const [manualToken, setManualToken] = useState("");
  const [verdict, setVerdict] = useState<ScanVerdict | null>(null);
  const [history, setHistory] = useState<{ time: string; result: string }[]>([]);

  const { data: matches } = useQuery({
    queryKey: ["scanner-matches"],
    queryFn: () => publicApi.get<PaginatedResult<Match>>("/matches", { pageSize: 50 }),
  });

  const { data: zones } = useQuery({
    queryKey: ["scanner-zones"],
    queryFn: () => publicApi.get<Zone[]>("/zones", { activeOnly: true }),
  });

  const scanMutation = useMutation({
    mutationFn: (token: string) =>
      api.post<ScanVerdict>("/access-control/scan", {
        token,
        matchId,
        zoneId: zoneId === "ANY" ? undefined : zoneId,
        deviceId: getScannerDeviceId(),
        gate: gate || undefined,
      }),
    onSuccess: (data) => {
      setVerdict(data);
      setHistory((prev) => [{ time: new Date().toLocaleTimeString("fr-FR"), result: data.result }, ...prev].slice(0, 8));
    },
    onError: () => {
      setVerdict({ result: "INVALID", reason: "Erreur de communication avec le serveur." });
    },
  });

  function handleDetect(token: string) {
    if (scanMutation.isPending) return;
    scanMutation.mutate(token);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="senegal-stripe h-1" />
      <header className="glass-panel flex h-16 items-center justify-between border-x-0 border-t-0 px-4 sm:px-6">
        <p className="flex items-center gap-2 font-display text-lg font-semibold">
          <ScanLine className="text-primary" /> Poste de contrôle FSF
        </p>
        <Button size="sm" variant="outline" onClick={() => logout()}>
          Déconnexion
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="glass-panel grid gap-3 rounded-2xl p-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Match</Label>
            <Select value={matchId ?? undefined} onValueChange={setMatchId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                {matches?.items.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.homeTeam} vs {m.awayTeam}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Zone contrôlée</Label>
            <Select value={zoneId} onValueChange={setZoneId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Toutes zones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ANY">Toutes zones</SelectItem>
                {zones?.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Poste / Porte</Label>
            <Input value={gate} onChange={(e) => setGate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <Button
            variant={mode === "camera" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("camera")}
          >
            <Video /> Scanner caméra
          </Button>
          <Button
            variant={mode === "manual" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setMode("manual")}
          >
            <Keyboard /> Saisie manuelle
          </Button>
        </div>

        <div className="mt-4">
          {!matchId ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Sélectionnez un match pour activer le scanner.
            </p>
          ) : mode === "camera" ? (
            <QrCameraScanner active={mode === "camera"} onDetect={handleDetect} />
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Coller le contenu du QR Code"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="font-mono"
              />
              <Button
                onClick={() => manualToken && handleDetect(manualToken)}
                disabled={!manualToken || scanMutation.isPending}
              >
                Vérifier
              </Button>
            </div>
          )}
        </div>

        {verdict && (
          <div className="mt-6">
            <ScanResultPanel verdict={verdict} />
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Derniers scans
            </p>
            <div className="flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs",
                    h.result === "VALID" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive",
                  )}
                >
                  {h.time} — {h.result}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
