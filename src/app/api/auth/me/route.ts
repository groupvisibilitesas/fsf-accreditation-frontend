import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";
import { getAccessToken } from "@/lib/session";
import { refreshSession } from "@/lib/refresh-session";
import { ApiError } from "@/lib/api-error";
import type { AuthenticatedUser } from "@/lib/types";

export async function GET() {
  const initialToken = await getAccessToken();
  if (!initialToken) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const user = await backendFetch<AuthenticatedUser>("/auth/me", { method: "POST", token: initialToken });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshedToken = await refreshSession();
      if (!refreshedToken) return NextResponse.json({ user: null }, { status: 200 });
      const user = await backendFetch<AuthenticatedUser>("/auth/me", { method: "POST", token: refreshedToken });
      return NextResponse.json({ user });
    }
    throw error;
  }
}
