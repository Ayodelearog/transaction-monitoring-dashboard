"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchTransaction, fetchTransactions } from "@/lib/api/transactions";
import { queryKeys } from "@/lib/query/keys";
import type { TransactionsQuery } from "@/lib/types";

export function useTransactions(query: TransactionsQuery) {
  return useQuery({
    queryKey: queryKeys.transactions(query),
    queryFn: () => fetchTransactions(query),
    placeholderData: keepPreviousData,
    refetchInterval: 20_000,
    refetchIntervalInBackground: false,
  });
}

export function useTransaction(id: string | null) {
  return useQuery({
    queryKey: queryKeys.transaction(id ?? "__none__"),
    queryFn: () => fetchTransaction(id as string),
    enabled: Boolean(id),
  });
}
