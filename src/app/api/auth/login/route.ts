import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";
import { persistSession } from "@/lib/session";
import { ApiError } from "@/lib/api-error";
import type { AuthTokensResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const tokens = await backendFetch<AuthTokensResponse>("/auth/login", {
      method: "POST",
      body,
    });
    await persistSession(tokens);
    return NextResponse.json({ user: tokens.user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ code: error.code, message: error.message }, { status: error.status });
    }
    throw error;
  }
}
