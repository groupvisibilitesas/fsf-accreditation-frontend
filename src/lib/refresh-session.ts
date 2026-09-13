import "server-only";
import { cookies } from "next/headers";
import { backendFetch } from "@/lib/backend-client";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, getRefreshToken } from "@/lib/session";

interface RefreshedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

const isProd = process.env.NODE_ENV === "production";
const baseCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax" as const,
  path: "/",
};

/** Rotation du jeton de rafraichissement — appelee par le proxy authentifie sur un 401. */
export async function refreshSession(): Promise<string | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const tokens = await backendFetch<RefreshedTokens>("/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
    const store = await cookies();
    store.set(ACCESS_TOKEN_COOKIE, tokens.accessToken, { ...baseCookieOptions, maxAge: 15 * 60 });
    store.set(REFRESH_TOKEN_COOKIE, tokens.refreshToken, { ...baseCookieOptions, maxAge: 30 * 24 * 60 * 60 });
    return tokens.accessToken;
  } catch {
    const store = await cookies();
    store.delete(ACCESS_TOKEN_COOKIE);
    store.delete(REFRESH_TOKEN_COOKIE);
    return null;
  }
}
