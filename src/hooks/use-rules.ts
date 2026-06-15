"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchRules, updateRule } from "@/lib/api/rules";
import { queryKeys } from "@/lib/query/keys";

export function useRules() {
  return useQuery({
    queryKey: queryKeys.rules,
    queryFn: fetchRules,
  });
}

export function useUpdateRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; enabled?: boolean; threshold?: number }) =>
      updateRule(vars.id, { enabled: vars.enabled, threshold: vars.threshold }),
    onSuccess: () => {
      // Coverage and triggered rules across the app depend on the active set,
      // so refetch the rules and invalidate any case views.
      qc.invalidateQueries({ queryKey: queryKeys.rules });
      qc.invalidateQueries({ queryKey: ["alerts"] });
      qc.invalidateQueries({ queryKey: ["alert"] });
    },
  });
}
