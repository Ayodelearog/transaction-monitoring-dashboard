"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardStats } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

interface VolumeChartProps {
  data: DashboardStats["weeklyVolume"] | undefined;
  loading?: boolean;
}

export function VolumeChart({ data, loading }: VolumeChartProps) {
  const chartData = useMemo(() => data ?? [], [data]);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Weekly transaction volume</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live count vs flagged transactions across the last 7 days
            </p>
          </div>
          <div className="flex gap-3 text-[11px]">
            <LegendDot label="Total" color="var(--color-primary)" />
            <LegendDot label="Flagged" color="var(--color-danger)" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[260px] sm:h-[300px]">
        {loading ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="totalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="flaggedFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                tickFormatter={(value) => formatNumber(Number(value))}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "hsl(var(--border))" }} />
              <Area
                type="monotone"
                dataKey="transactions"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#totalFill)"
                isAnimationActive
              />
              <Area
                type="monotone"
                dataKey="flagged"
                stroke="var(--color-danger)"
                strokeWidth={2}
                fill="url(#flaggedFill)"
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function LegendDot({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

interface TooltipPayload {
  payload: { day: string };
  value: number;
  name: string;
  color: string;
  dataKey: string;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const day = payload[0]?.payload?.day;
  return (
    <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-foreground mb-1">{day}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 text-muted-foreground capitalize">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="ml-auto font-semibold text-foreground tabular-nums">
            {formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
