"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "@/lib/api/transactions";
import { queryKeys } from "@/lib/query/keys";

export function useStats() {
  return useQuery({
    queryKey: queryKeys.stats,
    queryFn: fetchStats,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}
