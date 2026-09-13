"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompetitionDialog } from "@/components/admin/competition-dialog";
import { MatchDialog } from "@/components/admin/match-dialog";
import { MatchQuotaDialog } from "@/components/admin/match-quota-dialog";
import { api } from "@/lib/api-client";
import type { Competition, Match, PaginatedResult } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  OPEN: "bg-primary/15 text-primary",
  CLOSED: "bg-secondary/15 text-secondary",
  PLAYED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-destructive/15 text-destructive",
  ARCHIVED: "bg-muted text-muted-foreground",
};

export default function AdminMatchesPage() {
  const [competitionFilter, setCompetitionFilter] = useState<string>("ALL");

  const { data: competitions, isLoading: loadingCompetitions } = useQuery({
    queryKey: ["admin-competitions"],
    queryFn: () => api.get<PaginatedResult<Competition>>("/competitions", { pageSize: 100 }),
  });

  const { data: matches, isLoading: loadingMatches } = useQuery({
    queryKey: ["admin-matches", competitionFilter],
    queryFn: () =>
      api.get<PaginatedResult<Match>>("/matches", {
        pageSize: 100,
        ...(competitionFilter !== "ALL" ? { competitionId: competitionFilter } : {}),
      }),
  });

  const competitionList = competitions?.items ?? [];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Compétitions & matchs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez les matchs, configurez la jauge tribune presse et les quotas par catégorie.
          </p>
        </div>
        <div className="flex gap-2">
          <CompetitionDialog />
          {competitionList.length > 0 && <MatchDialog competitions={competitionList} />}
        </div>
      </div>

      <div className="glass-panel mb-6 overflow-x-auto rounded-2xl p-4">
        <p className="mb-3 text-sm font-medium">Compétitions</p>
        {loadingCompetitions ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Saison</TableHead>
                <TableHead>Organisateur</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitionList.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.season}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.organizer ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {competitionList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    Aucune compétition. Créez-en une pour commencer.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">Matchs</p>
        <Select value={competitionFilter} onValueChange={setCompetitionFilter}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrer par compétition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Toutes les compétitions</SelectItem>
            {competitionList.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl p-4">
        {loadingMatches ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Match</TableHead>
                <TableHead>Stade</TableHead>
                <TableHead>Coup d&apos;envoi</TableHead>
                <TableHead>Tribune presse</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches?.items.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">
                    {match.homeTeam} vs {match.awayTeam}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {match.stadium} — {match.city}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(
                      new Date(match.kickoffAt),
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {match.pressTribuneCapacity ?? "—"} pupitres
                  </TableCell>
                  <TableCell>
                    <Badge className={`border-0 ${STATUS_TONE[match.status] ?? ""}`}>{match.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1.5">
                      <MatchQuotaDialog match={match} />
                      <MatchDialog match={match} competitions={competitionList} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {matches?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Aucun match pour ce filtre.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
