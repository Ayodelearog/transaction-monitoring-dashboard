"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats, RiskLevel } from "@/lib/types";
import { riskLabel } from "@/lib/ui-mappings";

const riskColor: Record<RiskLevel, string> = {
  low: "var(--color-success)",
  medium: "var(--color-warning)",
  high: "var(--color-danger)",
  critical: "var(--color-danger)",
};

interface RiskDistributionProps {
  data?: DashboardStats["riskDistribution"];
  loading?: boolean;
}

export function RiskDistribution({ data, loading }: RiskDistributionProps) {
  const total = data?.reduce((sum, item) => sum + item.count, 0) ?? 0;
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Risk distribution</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">
          Share of transactions by computed risk band
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading || !data
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))
          : data.map((item) => {
              const pct = total ? Math.round((item.count / total) * 100) : 0;
              return (
                <div key={item.level} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {riskLabel[item.level]}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {item.count} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: riskColor[item.level] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
      </CardContent>
    </Card>
  );
}
