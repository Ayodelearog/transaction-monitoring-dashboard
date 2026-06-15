"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchCustomer, fetchCustomers, updateKyc } from "@/lib/api/customers";
import { queryKeys } from "@/lib/query/keys";
import type { CustomersQuery, KycStatus } from "@/lib/types";

export function useCustomers(query: CustomersQuery) {
  return useQuery({
    queryKey: queryKeys.customers(query),
    queryFn: () => fetchCustomers(query),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string | null) {
  return useQuery({
    queryKey: queryKeys.customer(id ?? "__none__"),
    queryFn: () => fetchCustomer(id as string),
    enabled: Boolean(id),
  });
}

export function useUpdateKyc(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kycStatus: KycStatus) => updateKyc(id, kycStatus),
    onSuccess: (detail) => {
      qc.setQueryData(queryKeys.customer(detail.id), detail);
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
