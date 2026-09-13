import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session";

interface JwtClaims {
  sub: string;
  kind: "STAFF" | "REQUESTER";
  role: string | null;
  exp: number;
}

function decodeJwt(token: string): JwtClaims | null {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = atob(padded);
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

const STAFF_ADMIN_ROLES = ["ADMIN", "RESPONSABLE_ACCREDITATION", "COMMISSION_VALIDATION", "SUPERVISEUR"];
const SCANNER_ROLES = ["ADMIN", "AGENT_CONTROLE"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const claims = token ? decodeJwt(token) : null;
  const isExpired = claims ? claims.exp * 1000 < Date.now() : true;
  const authenticated = Boolean(claims) && !isExpired;

  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  };

  if (pathname.startsWith("/admin")) {
    if (!authenticated || claims?.kind !== "STAFF" || !STAFF_ADMIN_ROLES.includes(claims.role ?? "")) {
      return redirectToLogin();
    }
  } else if (pathname.startsWith("/scanner")) {
    if (!authenticated || claims?.kind !== "STAFF" || !SCANNER_ROLES.includes(claims.role ?? "")) {
      return redirectToLogin();
    }
  } else if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/apply") ||
    pathname.startsWith("/media-desk")
  ) {
    if (!authenticated || claims?.kind !== "REQUESTER") {
      return redirectToLogin();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/apply/:path*", "/media-desk/:path*", "/admin/:path*", "/scanner/:path*"],
};
