import type { TransactionsQuery } from "@/lib/types";

export const queryKeys = {
  stats: ["stats"] as const,
  transactions: (query: TransactionsQuery) => ["transactions", query] as const,
  transaction: (id: string) => ["transaction", id] as const,
};
