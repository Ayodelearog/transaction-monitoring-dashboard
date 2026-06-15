"use client";

import { ListChecks, ShieldAlert, ToggleRight, Crosshair } from "lucide-react";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RuleCard } from "@/components/rules/rule-card";
import { useRules, useUpdateRule } from "@/hooks/use-rules";

export default function RulesPage() {
  const { data, isLoading } = useRules();
  const update = useUpdateRule();
  const rules = data?.data ?? [];

  const active = rules.filter((r) => r.enabled).length;
  const critical = rules.filter((r) => r.enabled && r.severity === "critical").length;
  const pendingId = update.isPending ? update.variables?.id : undefined;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Configuration
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground mt-1">
          Detection rules
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tune the monitoring engine. Enabled rules drive the flags and cases analysts see.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total rules"
          value={String(rules.length)}
          icon={<ListChecks className="h-4 w-4" />}
          tone="primary"
          loading={isLoading}
          index={0}
        />
        <KpiCard
          label="Active"
          value={String(active)}
          icon={<ToggleRight className="h-4 w-4" />}
          tone="success"
          loading={isLoading}
          index={1}
        />
        <KpiCard
          label="Critical rules"
          value={String(critical)}
          icon={<ShieldAlert className="h-4 w-4" />}
          tone="danger"
          loading={isLoading}
          index={2}
        />
        <KpiCard
          label="Transactions covered"
          value={
            data ? `${data.coverage}/${data.totalTransactions}` : "0"
          }
          icon={<Crosshair className="h-4 w-4" />}
          tone="info"
          loading={isLoading}
          index={3}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-24 w-full" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {rules.map((rule, i) => (
            <RuleCard
              key={rule.id}
              rule={rule}
              index={i}
              pending={pendingId === rule.id}
              onToggle={(enabled) => update.mutate({ id: rule.id, enabled })}
              onThreshold={(threshold) => update.mutate({ id: rule.id, threshold })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
