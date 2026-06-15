import type { CasesQuery, CustomersQuery, TransactionsQuery } from "@/lib/types";

export const queryKeys = {
  stats: ["stats"] as const,
  transactions: (query: TransactionsQuery) => ["transactions", query] as const,
  transaction: (id: string) => ["transaction", id] as const,
  alerts: (query: CasesQuery) => ["alerts", query] as const,
  alert: (id: string) => ["alert", id] as const,
  customers: (query: CustomersQuery) => ["customers", query] as const,
  customer: (id: string) => ["customer", id] as const,
  rules: ["rules"] as const,
};
