import { api } from "./client";
import type {
  CustomerDetail,
  CustomersQuery,
  KycStatus,
  PaginatedCustomers,
} from "@/lib/types";

export function fetchCustomers(query: CustomersQuery = {}) {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.kyc && query.kyc !== "all") params.set("kyc", query.kyc);
  if (query.risk && query.risk !== "all") params.set("risk", query.risk);
  params.set("page", String(query.page ?? 1));
  params.set("pageSize", String(query.pageSize ?? 10));
  return api.get<PaginatedCustomers>(`/api/customers?${params.toString()}`);
}

export function fetchCustomer(id: string) {
  return api.get<CustomerDetail>(`/api/customers/${id}`);
}

export function updateKyc(id: string, kycStatus: KycStatus) {
  return api.patch<CustomerDetail>(`/api/customers/${id}`, { kycStatus });
}
