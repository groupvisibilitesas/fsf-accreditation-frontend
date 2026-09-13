"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { KeyRound, Search, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import type { Accreditation, AccreditationRequest, PaginatedResult, PublicKeyInfo } from "@/lib/types";

export default function AdminSecurityPage() {
  const [reference, setReference] = useState("");
  const [inspected, setInspected] = useState<Accreditation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: publicKey } = useQuery({
    queryKey: ["ecdsa-public-key"],
    queryFn: () => api.get<PublicKeyInfo>("/access-control/public-key"),
  });

  async function inspect() {
    setError(null);
    setInspected(null);
    try {
      const found = await api
        .get<PaginatedResult<AccreditationRequest>>("/admin/requests", { pageSize: 100 })
        .then((page) => page.items.find((r) => r.uniqueReference === reference.trim()));
      if (!found) {
        setError("Aucun dossier ne correspond à cette référence.");
        return;
      }
      const accreditation = await api.get<Accreditation>(`/admin/accreditations/by-request/${found.id}`);
      setInspected(accreditation);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Une erreur est survenue.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Sécurité cryptographique</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Clé publique ECDSA P-256 utilisée pour la vérification hors-ligne des badges.
      </p>

      <div className="glass-panel mt-4 rounded-2xl p-6">
        <p className="flex items-center gap-2 font-medium">
          <KeyRound className="size-4 text-primary" /> Clé publique de vérification
        </p>
        {publicKey ? (
          <>
            <p className="mt-3 font-mono text-xs text-primary">{publicKey.fingerprint}</p>
            <p className="mt-1 text-xs text-muted-foreground">{publicKey.algorithm}</p>
            <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-muted/50 p-3 text-[0.65rem] leading-relaxed text-muted-foreground">
              {publicKey.publicKeyPem}
            </pre>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Chargement...</p>
        )}
      </div>

      <div className="glass-panel mt-4 rounded-2xl p-6">
        <p className="flex items-center gap-2 font-medium">
          <ShieldCheck className="size-4 text-primary" /> Inspecteur de signature
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Consultez la signature ECDSA d&apos;une accréditation depuis la page de détail de la
          demande (onglet Demandes → sélectionner une demande validée).
        </p>
        <div className="mt-3 flex gap-2">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="ref">Référence de dossier</Label>
            <Input
              id="ref"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="FSF-2026-841140"
            />
          </div>
          <Button variant="outline" className="self-end" onClick={inspect}>
            <Search /> Rechercher
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
        {inspected?.cryptoSignature && (
          <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted/50 p-3 text-[0.65rem] leading-relaxed text-muted-foreground">
            {JSON.stringify(inspected.cryptoSignature, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
