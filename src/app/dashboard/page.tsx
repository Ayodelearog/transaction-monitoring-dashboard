"use client";

import Link from "next/link";
import { ArrowRight, Flag, Gauge, Receipt, Users } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { RiskDistribution } from "@/components/dashboard/risk-distribution";
import { LiveIndicator } from "@/components/dashboard/live-indicator";
import { useStats } from "@/hooks/use-stats";
import { formatCompact, formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth";

export default function DashboardPage() {
  const { data, isLoading, isFetching, dataUpdatedAt } = useStats();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Overview
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
            Welcome back, {user?.name?.split(" ")[0] ?? "Analyst"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here is the pulse of your transaction monitoring program.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LiveIndicator isFetching={isFetching} lastUpdated={dataUpdatedAt} />
          <Link
            href="/dashboard/transactions"
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            View all transactions <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          index={0}
          label="Total transactions"
          value={data ? formatCompact(data.totalTransactions) : ""}
          trend={data?.transactionsTrend}
          helper="vs last 7 days"
          icon={<Receipt className="h-4 w-4" />}
          tone="primary"
          loading={isLoading}
        />
        <KpiCard
          index={1}
          label="Flagged transactions"
          value={data ? formatNumber(data.flaggedTransactions) : ""}
          trend={data?.flaggedTrend}
          helper="needs analyst review"
          icon={<Flag className="h-4 w-4" />}
          tone="danger"
          loading={isLoading}
        />
        <KpiCard
          index={2}
          label="Total customers"
          value={data ? formatCompact(data.totalCustomers) : ""}
          trend={data?.customersTrend}
          helper="active in last 30 days"
          icon={<Users className="h-4 w-4" />}
          tone="success"
          loading={isLoading}
        />
        <KpiCard
          index={3}
          label="Average risk score"
          value={data ? `${data.averageRiskScore}/100` : ""}
          trend={data?.riskTrend}
          helper="lower is safer"
          icon={<Gauge className="h-4 w-4" />}
          tone="info"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <VolumeChart data={data?.weeklyVolume} loading={isLoading} />
        </div>
        <div>
          <RiskDistribution data={data?.riskDistribution} loading={isLoading} />
        </div>
      </div>
    </div>
  );
}
