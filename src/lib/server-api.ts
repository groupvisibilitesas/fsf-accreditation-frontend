import "server-only";
import { backendFetch } from "@/lib/backend-client";
import type {
  AccreditationCategory,
  Match,
  MatchQuota,
  MediaSummary,
  PaginatedResult,
  Zone,
} from "@/lib/types";

export const publicServerApi = {
  listOpenMatches: () =>
    backendFetch<PaginatedResult<Match>>("/matches", {
      searchParams: { status: "OPEN", pageSize: 50 },
    }),
  getMatch: (id: string) => backendFetch<Match>(`/matches/${id}`),
  listQuotas: (matchId: string) => backendFetch<MatchQuota[]>(`/matches/${matchId}/quotas`),
  listCategories: () => backendFetch<AccreditationCategory[]>("/accreditation-categories", {
    searchParams: { activeOnly: true },
  }),
  listZones: () => backendFetch<Zone[]>("/zones", { searchParams: { activeOnly: true } }),
  listPublicMedia: () => backendFetch<MediaSummary[]>("/media/public"),
};
