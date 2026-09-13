"use client";

import { ApiError } from "@/lib/api-error";

interface Envelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  formData?: FormData;
  searchParams?: Record<string, string | number | boolean | undefined>;
}

function buildQuery(params?: RequestOptions["searchParams"]): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function request<T>(base: string, path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let body: BodyInit | undefined;

  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${base}/${path.replace(/^\//, "")}${buildQuery(options.searchParams)}`, {
    method: options.method ?? "GET",
    headers,
    body,
    credentials: "include",
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

/** Requetes authentifiees (proxy `/api/proxy/*`, jeton gere cote serveur via cookies httpOnly). */
export const api = {
  get: <T>(path: string, searchParams?: RequestOptions["searchParams"]) =>
    request<T>("/api/proxy", path, { method: "GET", searchParams }),
  post: <T>(path: string, body?: unknown) => request<T>("/api/proxy", path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) => request<T>("/api/proxy", path, { method: "PATCH", body }),
  put: <T>(path: string, body?: unknown) => request<T>("/api/proxy", path, { method: "PUT", body }),
  delete: <T>(path: string) => request<T>("/api/proxy", path, { method: "DELETE" }),
  upload: <T>(path: string, formData: FormData) => request<T>("/api/proxy", path, { method: "POST", formData }),
};

/** Lectures publiques (proxy `/api/public/*`, aucune authentification requise). */
export const publicApi = {
  get: <T>(path: string, searchParams?: RequestOptions["searchParams"]) =>
    request<T>("/api/public", path, { method: "GET", searchParams }),
};
