"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileSpreadsheet, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, publicApi } from "@/lib/api-client";
import type {
  AccreditationCategory,
  Competition,
  Match,
  Media,
  PaginatedResult,
} from "@/lib/types";

const REPORTS = [
  {
    key: "requests",
    label: "Toutes les demandes",
    description: "Liste complète des demandes, tous statuts confondus.",
  },
  {
    key: "accredited",
    label: "Accrédités",
    description: "Accréditations par match, média et catégorie.",
  },
  {
    key: "rejected",
    label: "Demandes refusées",
    description: "Dossiers refusés, avec motif et décideur.",
  },
  {
    key: "pending",
    label: "Dossiers en attente",
    description: "Dossiers non encore décidés, avec ancienneté.",
  },
  {
    key: "entries",
    label: "Entrées contrôlées",
    description: "Scans valides (entrées effectives).",
  },
  {
    key: "anomalies",
    label: "Anomalies de contrôle",
    description: "Scans refusés : invalide, expiré, révoqué, déjà utilisé, hors périmètre.",
  },
] as const;

const FORMATS = [
  { format: "csv", label: "CSV", icon: FileText },
  { format: "xlsx", label: "Excel", icon: FileSpreadsheet },
  { format: "pdf", label: "PDF", icon: FileType },
] as const;

function buildHref(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "ALL") search.set(key, value);
  }
  const qs = search.toString();
  return `/api/proxy/${path}${qs ? `?${qs}` : ""}`;
}

export default function AdminExportsPage() {
  const [competitionId, setCompetitionId] = useState("ALL");
  const [matchId, setMatchId] = useState("ALL");
  const [mediaId, setMediaId] = useState("ALL");
  const [categoryId, setCategoryId] = useState("ALL");

  const { data: competitions } = useQuery({
    queryKey: ["export-filter-competitions"],
    queryFn: () => api.get<PaginatedResult<Competition>>("/competitions", { pageSize: 100 }),
  });
  const { data: matches } = useQuery({
    queryKey: ["export-filter-matches"],
    queryFn: () => publicApi.get<PaginatedResult<Match>>("/matches", { pageSize: 100 }),
  });
  const { data: media } = useQuery({
    queryKey: ["export-filter-media"],
    queryFn: () => api.get<PaginatedResult<Media>>("/media", { pageSize: 100 }),
  });
  const { data: categories } = useQuery({
    queryKey: ["export-filter-categories"],
    queryFn: () => api.get<AccreditationCategory[]>("/accreditation-categories"),
  });

  const filters = { competitionId, matchId, mediaId, categoryId };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold">Exports & rapports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cahier §26 — chaque export mentionne le périmètre, la date de génération, l&apos;auteur et
          une confidentialité d&apos;usage interne.
        </p>
      </div>

      <div className="glass-panel mb-6 rounded-2xl p-4">
        <p className="mb-3 text-sm font-medium">Périmètre (optionnel)</p>
        <div className="flex flex-wrap gap-3">
          <Select value={competitionId} onValueChange={setCompetitionId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Compétition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes compétitions</SelectItem>
              {competitions?.items.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name} ({c.season})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={matchId} onValueChange={setMatchId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Match" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les matchs</SelectItem>
              {matches?.items.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={mediaId} onValueChange={setMediaId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Média" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tous les médias</SelectItem>
              {media?.items.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Toutes catégories</SelectItem>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {REPORTS.map((report) => (
          <div key={report.key} className="glass-panel rounded-2xl p-4">
            <p className="font-display text-base font-semibold">{report.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{report.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FORMATS.map(({ format, label, icon: Icon }) => (
                <Button key={format} asChild size="sm" variant="outline">
                  <a href={buildHref(`admin/exports/${report.key}/${format}`, filters)}>
                    <Icon /> {label}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel mt-6 rounded-2xl p-4">
        <p className="font-display text-base font-semibold">Rapport jour de match</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Synthèse PDF (accrédités, entrées, refus, répartition par zone) pour un match précis —
          cahier §22, §26.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Select value={matchId} onValueChange={setMatchId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Sélectionner un match" />
            </SelectTrigger>
            <SelectContent>
              {matches?.items.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.homeTeam} vs {m.awayTeam}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild size="sm" className={matchId === "ALL" ? "pointer-events-none opacity-50" : undefined}>
            <a
              href={
                matchId === "ALL"
                  ? undefined
                  : buildHref("admin/exports/match-day/pdf", { matchId })
              }
              aria-disabled={matchId === "ALL"}
              onClick={(e) => {
                if (matchId === "ALL") e.preventDefault();
              }}
            >
              <FileType /> Télécharger le PDF
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
