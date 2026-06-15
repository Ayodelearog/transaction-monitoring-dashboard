import { ApiError, api } from "./client";
import type {
  CaseRecord,
  CasesQuery,
  CaseStatus,
  PaginatedCases,
  SarReport,
} from "@/lib/types";

export function fetchAlerts(query: CasesQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.priority && query.priority !== "all") params.set("priority", query.priority);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 10));
  return api.get<PaginatedCases>(`/api/alerts?${params.toString()}`);
}

export function fetchAlert(id: string) {
  return api.get<CaseRecord>(`/api/alerts/${id}`);
}

export function updateAlert(
  id: string,
  patch: { status?: CaseStatus; assignee?: string | null },
) {
  return api.patch<CaseRecord>(`/api/alerts/${id}`, patch);
}

export function addAlertNote(id: string, body: string) {
  return api.post<CaseRecord>(`/api/alerts/${id}/notes`, { body });
}

export function escalateAlert(id: string) {
  return api.post<CaseRecord>(`/api/alerts/${id}/escalate`, {});
}

export function saveAlertSar(
  id: string,
  narrative: string,
  draftedBy: SarReport["draftedBy"],
  status: SarReport["status"],
) {
  return api.post<CaseRecord>(`/api/alerts/${id}/sar`, {
    narrative,
    draftedBy,
    status,
  });
}

/**
 * Consume a server text stream (AI Gateway → Claude), invoking `onDelta` with
 * each chunk as it arrives. Resolves with the full text once the stream ends.
 */
export async function streamAlertText(
  path: string,
  onDelta: (full: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const response = await fetch(path, { method: "POST", signal });
  if (!response.ok || !response.body) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // streamed responses have no JSON error body
    }
    throw new ApiError(message, response.status);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let full = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    full += decoder.decode(value, { stream: true });
    onDelta(full);
  }
  return full;
}
