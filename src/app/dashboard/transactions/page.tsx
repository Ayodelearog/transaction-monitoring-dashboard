"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { TransactionsFilters } from "@/components/transactions/transactions-filters";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { Pagination } from "@/components/transactions/pagination";
import { TransactionDrawer } from "@/components/transactions/transaction-drawer";
import { useTransactions } from "@/hooks/use-transactions";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { RiskLevel, Transaction, TransactionStatus } from "@/lib/types";

interface FilterState {
  search: string;
  status: TransactionStatus | "all";
  risk: RiskLevel | "all";
}

export default function TransactionsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: "all",
    risk: "all",
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Transaction | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const query = {
    search: debouncedSearch,
    status: filters.status,
    risk: filters.risk,
    page,
    pageSize: 10,
  };

  const { data, isLoading, isFetching, dataUpdatedAt } = useTransactions(query);

  const handleFiltersChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monitoring
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
            Transactions
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Investigate flagged transfers, payments, and high-risk activity.
          </p>
        </div>
        <LiveIndicator isFetching={isFetching} lastUpdated={dataUpdatedAt} />
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-border">
          <TransactionsFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <TransactionsTable
          rows={data?.data ?? []}
          loading={isLoading}
          onSelect={setSelected}
        />
        <div className="px-5 py-4 border-t border-border">
          <Pagination
            page={data?.page ?? page}
            pageSize={data?.pageSize ?? 10}
            total={data?.total ?? 0}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <TransactionDrawer
        transactionId={selected?.id ?? null}
        fallback={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
