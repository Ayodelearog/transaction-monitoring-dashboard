"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  addAlertNote,
  escalateAlert,
  fetchAlert,
  fetchAlerts,
  saveAlertSar,
  updateAlert,
} from "@/lib/api/alerts";
import { queryKeys } from "@/lib/query/keys";
import type { CaseRecord, CasesQuery, CaseStatus, SarReport } from "@/lib/types";

export function useAlerts(query: CasesQuery) {
  return useQuery({
    queryKey: queryKeys.alerts(query),
    queryFn: () => fetchAlerts(query),
    placeholderData: keepPreviousData,
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });
}

export function useAlert(id: string | null) {
  return useQuery({
    queryKey: queryKeys.alert(id ?? "__none__"),
    queryFn: () => fetchAlert(id as string),
    enabled: Boolean(id),
  });
}

/** Shared cache write: replace the single-case cache and refresh the queue. */
function useCaseMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<CaseRecord>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (record) => {
      qc.setQueryData(queryKeys.alert(record.id), record);
      qc.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

export function useUpdateAlert(id: string) {
  return useCaseMutation((patch: { status?: CaseStatus; assignee?: string | null }) =>
    updateAlert(id, patch),
  );
}

export function useAddNote(id: string) {
  return useCaseMutation((body: string) => addAlertNote(id, body));
}

export function useEscalateAlert(id: string) {
  return useCaseMutation<void>(() => escalateAlert(id));
}

export function useSaveSar(id: string) {
  return useCaseMutation(
    (vars: {
      narrative: string;
      draftedBy: SarReport["draftedBy"];
      status: SarReport["status"];
    }) => saveAlertSar(id, vars.narrative, vars.draftedBy, vars.status),
  );
}
