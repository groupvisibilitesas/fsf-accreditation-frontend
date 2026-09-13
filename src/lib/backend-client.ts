import "server-only";
import { BACKEND_URL } from "@/lib/env";
import { ApiError } from "@/lib/api-error";

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  requestId: string;
  timestamp: string;
}

export interface BackendRequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  token?: string;
  body?: unknown;
  /** Corps deja pret a l'emploi (FormData) — desactive la serialisation JSON. */
  formData?: FormData;
  searchParams?: Record<string, string | number | boolean | undefined>;
  cache?: RequestCache;
}

function buildUrl(path: string, searchParams?: BackendRequestOptions["searchParams"]): string {
  const url = new URL(`${BACKEND_URL}${path.startsWith("/") ? path : `/${path}`}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/** Appelle directement l'API NestJS depuis le serveur (Route Handlers, Server Components). */
export async function backendFetch<T>(path: string, options: BackendRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(buildUrl(path, options.searchParams), {
    method: options.method ?? "GET",
    headers,
    body,
    cache: options.cache ?? "no-store",
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? ((await response.json()) as Envelope<T>) : undefined;

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.error ?? { code: "UNKNOWN_ERROR", message: "Une erreur est survenue." },
      response.status,
    );
  }

  return payload.data as T;
}
