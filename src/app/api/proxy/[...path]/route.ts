import { NextRequest, NextResponse } from "next/server";
import { BACKEND_URL } from "@/lib/env";
import { getAccessToken } from "@/lib/session";
import { refreshSession } from "@/lib/refresh-session";

/**
 * Proxy authentifie generique : le navigateur n'a jamais acces au jeton
 * d'acces (cookie httpOnly). Toute requete cote client vers l'API NestJS
 * passe par ici, qui ajoute l'en-tete Authorization et tente une rotation
 * du refresh token en cas de 401 (un seul essai).
 */
async function forward(request: NextRequest, path: string[], token: string): Promise<Response> {
  const targetUrl = `${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`;
  const contentType = request.headers.get("content-type") ?? "";
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  let body: BodyInit | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    if (contentType.includes("multipart/form-data")) {
      body = await request.formData();
    } else if (contentType.includes("application/json")) {
      headers["Content-Type"] = "application/json";
      body = await request.text();
    }
  }

  return fetch(targetUrl, { method: request.method, headers, body, cache: "no-store" });
}

async function handle(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  let token = await getAccessToken();

  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHENTICATED", message: "Session expiree." } },
      { status: 401 },
    );
  }

  let response = await forward(request, path, token);

  if (response.status === 401) {
    const newToken = await refreshSession();
    if (!newToken) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHENTICATED", message: "Session expiree." } },
        { status: 401 },
      );
    }
    token = newToken;
    response = await forward(request, path, token);
  }

  // ArrayBuffer (pas `.text()`) : preserve les reponses binaires (exports
  // PDF/XLSX) que UTF-8 corromprait a l'aller-retour texte.
  const responseBody = await response.arrayBuffer();
  const headers: Record<string, string> = {
    "Content-Type": response.headers.get("content-type") ?? "application/json",
  };
  const disposition = response.headers.get("content-disposition");
  if (disposition) headers["Content-Disposition"] = disposition;
  return new NextResponse(responseBody, { status: response.status, headers });
}

export {
  handle as GET,
  handle as POST,
  handle as PATCH,
  handle as PUT,
  handle as DELETE,
};
