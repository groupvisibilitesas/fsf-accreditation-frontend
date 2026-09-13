"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AuthenticatedUser } from "@/lib/types";

async function fetchSession(): Promise<AuthenticatedUser | null> {
  const response = await fetch("/api/auth/me", { credentials: "include" });
  const payload = (await response.json()) as { user: AuthenticatedUser | null };
  return payload.user;
}

export const SESSION_QUERY_KEY = ["session"] as const;

export function useSession() {
  const query = useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: fetchSession,
    staleTime: 60_000,
  });

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    queryClient.setQueryData(SESSION_QUERY_KEY, null);
    router.push("/");
    router.refresh();
  };
}
