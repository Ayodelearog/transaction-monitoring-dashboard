"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Inbox, Search, ShieldAlert, Siren } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { Pagination } from "@/components/transactions/pagination";
import { AlertsFilters, type AlertFilters } from "@/components/alerts/alerts-filters";
import { AlertsTable } from "@/components/alerts/alerts-table";
import { CaseDrawer } from "@/components/alerts/case-drawer";
import { ExportButton } from "@/components/ui/export-button";
import { useAlerts } from "@/hooks/use-alerts";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { CaseRecord } from "@/lib/types";

export default function AlertsPage() {
  const searchParams = useSearchParams();
  const urlOpen = searchParams.get("open");

  const [filters, setFilters] = useState<AlertFilters>({
    search: "",
    status: "all",
    priority: "all",
  });
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(urlOpen);
  const [selectedFallback, setSelectedFallback] = useState<CaseRecord | null>(null);

  const debouncedSearch = useDebouncedValue(filters.search, 300);
  const query = {
    search: debouncedSearch,
    status: filters.status,
    priority: filters.priority,
    page,
    pageSize: 10,
  };

  const { data, isLoading, isFetching, dataUpdatedAt } = useAlerts(query);
  const counts = data?.counts;

  const handleFiltersChange = (next: AlertFilters) => {
    setFilters(next);
    setPage(1);
  };

  const handleSelect = (record: CaseRecord) => {
    setSelectedId(record.id);
    setSelectedFallback(record);
  };

  const handleClose = () => {
    setSelectedId(null);
    setSelectedFallback(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Investigations
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
            Alert queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Triage and resolve compliance cases with an AI assistant in the loop.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportButton
            dataset="alerts"
            params={{
              search: debouncedSearch,
              status: filters.status,
              priority: filters.priority,
            }}
          />
          <LiveIndicator isFetching={isFetching} lastUpdated={dataUpdatedAt} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Open"
          value={String(counts?.open ?? 0)}
          icon={<Inbox className="h-4 w-4" />}
          tone="info"
          loading={isLoading}
          index={0}
        />
        <KpiCard
          label="Investigating"
          value={String(counts?.investigating ?? 0)}
          icon={<Search className="h-4 w-4" />}
          tone="primary"
          loading={isLoading}
          index={1}
        />
        <KpiCard
          label="Escalated"
          value={String(counts?.escalated ?? 0)}
          icon={<Siren className="h-4 w-4" />}
          tone="danger"
          loading={isLoading}
          index={2}
        />
        <KpiCard
          label="Closed"
          value={String(counts?.closed ?? 0)}
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="success"
          loading={isLoading}
          index={3}
        />
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-border">
          <AlertsFilters value={filters} onChange={handleFiltersChange} />
        </div>
        <AlertsTable
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
            noun="cases"
          />
        </div>
      </Card>

      <CaseDrawer
        caseId={selectedId}
        fallback={selectedFallback}
        onClose={handleClose}
      />
    </div>
  );
}
