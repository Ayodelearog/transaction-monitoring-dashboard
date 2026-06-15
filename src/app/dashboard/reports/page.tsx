"use client";

import { format } from "date-fns";
import { Printer, Receipt, ShieldAlert, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ExportButton } from "@/components/ui/export-button";
import { useStats } from "@/hooks/use-stats";
import { useAlerts } from "@/hooks/use-alerts";
import { useRules } from "@/hooks/use-rules";
import { formatNumber } from "@/lib/utils";
import {
  caseStatusLabel,
  riskLabel,
  riskTone,
} from "@/lib/ui-mappings";
import type { CaseStatus, RiskLevel } from "@/lib/types";

const EXPORTS: Array<{
  dataset: "transactions" | "alerts" | "customers";
  title: string;
  description: string;
  icon: typeof Receipt;
}> = [
  {
    dataset: "transactions",
    title: "Transactions",
    description: "Every transaction with customer, amount, risk, and status.",
    icon: Receipt,
  },
  {
    dataset: "alerts",
    title: "Cases",
    description: "The full case queue with priority, status, and triggered rules.",
    icon: ShieldAlert,
  },
  {
    dataset: "customers",
    title: "Customers",
    description: "Customer directory with KYC status and risk exposure.",
    icon: Users,
  },
];

const CASE_STATUSES: CaseStatus[] = ["open", "investigating", "escalated", "closed"];

export default function ReportsPage() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: alerts } = useAlerts({ pageSize: 1 });
  const { data: rules } = useRules();

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Reporting
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
            Reports &amp; exports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Download datasets as CSV, or generate a printable compliance summary.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="inline-flex h-9 items-center gap-2 self-start rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:self-auto"
        >
          <Printer className="h-4 w-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* CSV exports */}
      <div className="no-print grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.dataset} className="flex flex-col p-5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 flex-1 text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-4">
                <ExportButton dataset={item.dataset} label={`Download ${item.title} CSV`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Printable compliance summary */}
      <div className="print-area">
        <Card className="p-6 sm:p-8">
          <header className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                AML compliance summary
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Smartcomply · Transaction Monitoring workspace
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              Generated
              <br />
              {format(new Date(), "MMM d, yyyy · h:mm a")}
            </p>
          </header>

          {statsLoading || !stats ? (
            <Skeleton className="mt-6 h-40 w-full" />
          ) : (
            <div className="mt-6 space-y-8">
              <SummaryGrid
                items={[
                  { label: "Total transactions", value: formatNumber(stats.totalTransactions) },
                  { label: "Flagged", value: formatNumber(stats.flaggedTransactions) },
                  { label: "Customers", value: formatNumber(stats.totalCustomers) },
                  { label: "Avg risk score", value: `${stats.averageRiskScore}/100` },
                ]}
              />

              <ReportSection title="Risk distribution">
                <table className="w-full text-sm">
                  <tbody>
                    {stats.riskDistribution.map((bucket) => (
                      <tr key={bucket.level} className="border-t border-border">
                        <td className="py-2">
                          <Badge tone={riskTone[bucket.level as RiskLevel]} dot>
                            {riskLabel[bucket.level as RiskLevel]}
                          </Badge>
                        </td>
                        <td className="py-2 text-right font-semibold text-foreground tabular-nums">
                          {bucket.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ReportSection>

              {alerts && (
                <ReportSection title="Case queue">
                  <table className="w-full text-sm">
                    <tbody>
                      {CASE_STATUSES.map((status) => (
                        <tr key={status} className="border-t border-border">
                          <td className="py-2 text-muted-foreground">{caseStatusLabel[status]}</td>
                          <td className="py-2 text-right font-semibold text-foreground tabular-nums">
                            {alerts.counts[status]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ReportSection>
              )}

              {rules && (
                <ReportSection title="Detection coverage">
                  <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                    <SummaryStat
                      label="Active rules"
                      value={`${rules.data.filter((r) => r.enabled).length}/${rules.data.length}`}
                    />
                    <SummaryStat
                      label="Transactions covered"
                      value={`${rules.coverage}/${rules.totalTransactions}`}
                    />
                    <SummaryStat
                      label="Weekly flagged"
                      value={formatNumber(
                        stats.weeklyVolume.reduce((sum, d) => sum + d.flagged, 0),
                      )}
                    />
                  </dl>
                </ReportSection>
              )}

              <p className="border-t border-border pt-4 text-[11px] text-muted-foreground">
                This summary is generated from demo data for portfolio purposes and is not a
                regulatory filing. Figures reflect the workspace at the time of generation.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function SummaryGrid({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1 text-xl font-semibold text-foreground tabular-nums">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-base font-semibold text-foreground tabular-nums">{value}</dd>
    </div>
  );
}

function ReportSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}
