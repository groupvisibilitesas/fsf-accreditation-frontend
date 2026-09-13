"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { RequestRowActions } from "@/components/admin/request-row-actions";
import { api, publicApi } from "@/lib/api-client";
import type { AccreditationRequest, Match, PaginatedResult, RequestStatus } from "@/lib/types";

const STATUSES: RequestStatus[] = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "INFO_REQUESTED",
  "COMPLETE",
  "PENDING_VALIDATION",
  "VALIDATED",
  "REJECTED",
  "BADGE_GENERATED",
  "ACCESS_USED",
  "CANCELLED",
];

export default function AdminRequestsPage() {
  const [status, setStatus] = useState<RequestStatus | "ALL">("ALL");
  const [matchId, setMatchId] = useState<string | "ALL">("ALL");

  const { data: matches } = useQuery({
    queryKey: ["admin-matches-filter"],
    queryFn: () => publicApi.get<PaginatedResult<Match>>("/matches", { pageSize: 100 }),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-requests", status, matchId],
    queryFn: () =>
      api.get<PaginatedResult<AccreditationRequest>>("/admin/requests", {
        pageSize: 100,
        ...(status !== "ALL" ? { status } : {}),
        ...(matchId !== "ALL" ? { matchId } : {}),
      }),
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Demandes d&apos;accréditation</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Modération, complément, validation avec attribution de zones.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as RequestStatus | "ALL")}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous les statuts</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
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
      </div>

      <div className="glass-panel mt-4 overflow-x-auto rounded-2xl p-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Demandeur</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-mono text-xs">{request.uniqueReference}</TableCell>
                  <TableCell>
                    {request.requester?.firstName} {request.requester?.lastName}
                    <p className="text-xs text-muted-foreground">{request.requester?.media?.name}</p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.match?.homeTeam} vs {request.match?.awayTeam}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {request.categoryRequested?.label}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={request.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RequestRowActions request={request} />
                  </TableCell>
                </TableRow>
              ))}
              {data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                    Aucune demande pour ces filtres.
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
