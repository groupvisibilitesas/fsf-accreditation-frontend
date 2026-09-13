import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/env";

/** Relai simple (sans authentification) pour les lectures publiques appelees depuis le navigateur. */
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;
  const response = await fetch(targetUrl, { cache: "no-store" });
  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
