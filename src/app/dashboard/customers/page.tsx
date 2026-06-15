"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleCheck, CircleX, Clock, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Pagination } from "@/components/transactions/pagination";
import {
  CustomersFilters,
  type CustomerFilters,
} from "@/components/customers/customers-filters";
import { CustomersTable } from "@/components/customers/customers-table";
import { CustomerDrawer } from "@/components/customers/customer-drawer";
import { useCustomers } from "@/hooks/use-customers";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CustomerRecord } from "@/lib/types";

export default function CustomersPage() {
  const searchParams = useSearchParams();
  const urlOpen = searchParams.get("open");

  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    kyc: "all",
    risk: "all",
  });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(urlOpen);
  const [selectedFallback, setSelectedFallback] = useState<CustomerRecord | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const query = {
    search: debouncedSearch,
    kyc: filters.kyc,
    risk: filters.risk,
    page,
    pageSize: 10,
  };

  const { data, isLoading } = useCustomers(query);
  const counts = data?.counts;
  const total =
    counts ? counts.verified + counts.pending + counts.rejected : undefined;

  const handleFiltersChange = (next: CustomerFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleSelect = (record: CustomerRecord) => {
    setSelectedId(record.id);
    setSelectedFallback(record);
  };

  const handleClose = () => {
    setSelectedId(null);
    setSelectedFallback(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Directory
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
          Customers
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review customer profiles, KYC status, and risk exposure.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total customers"
          value={String(total ?? 0)}
          icon={<Users className="h-4 w-4" />}
          tone="primary"
          loading={isLoading}
          index={0}
        />
        <KpiCard
          label="Verified"
          value={String(counts?.verified ?? 0)}
          icon={<CircleCheck className="h-4 w-4" />}
          tone="success"
          loading={isLoading}
          index={1}
        />
        <KpiCard
          label="Pending KYC"
          value={String(counts?.pending ?? 0)}
          icon={<Clock className="h-4 w-4" />}
          tone="info"
          loading={isLoading}
          index={2}
        />
        <KpiCard
          label="Rejected"
          value={String(counts?.rejected ?? 0)}
          icon={<CircleX className="h-4 w-4" />}
          tone="danger"
          loading={isLoading}
          index={3}
        />
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-border">
          <CustomersFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <CustomersTable
          rows={data?.data ?? []}
          loading={isLoading}
          onSelect={handleSelect}
        />
        <div className="px-5 py-4 border-t border-border">
          <Pagination
            page={data?.page ?? page}
            pageSize={data?.pageSize ?? 10}
            total={data?.total ?? 0}
            onPageChange={setPage}
            noun="customers"
          />
        </div>
      </Card>

      <CustomerDrawer
        customerId={selectedId}
        fallback={selectedFallback}
        onClose={handleClose}
      />
    </div>
  );
}
