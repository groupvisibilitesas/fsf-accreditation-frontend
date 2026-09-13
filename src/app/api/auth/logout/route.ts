import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend-client";
import { clearSession, getRefreshToken } from "@/lib/session";

export async function POST() {
  const refreshToken = await getRefreshToken();
  if (refreshToken) {
    await backendFetch("/auth/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
