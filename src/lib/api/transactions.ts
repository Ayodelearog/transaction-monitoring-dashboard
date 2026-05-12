import { api } from "./client";
import type {
  DashboardStats,
  PaginatedTransactions,
  Transaction,
  TransactionsQuery,
} from "@/lib/types";

export function fetchStats() {
  return api.get<DashboardStats>("/api/stats");
}

export function fetchTransactions(query: TransactionsQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.risk && query.risk !== "all") params.set("risk", query.risk);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 10));
  return api.get<PaginatedTransactions>(`/api/transactions?${params.toString()}`);
}

export function fetchTransaction(id: string) {
  return api.get<Transaction>(`/api/transactions/${id}`);
}
