"use client";

import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { CaseRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  caseStatusLabel,
  caseStatusTone,
  riskLabel,
  riskTone,
} from "@/lib/ui-mappings";

interface AlertsTableProps {
  rows: CaseRecord[];
  loading: boolean;
  rowCount?: number;
  onSelect: (record: CaseRecord) => void;
}

export function AlertsTable({ rows, loading, rowCount = 8, onSelect }: AlertsTableProps) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck className="h-4 w-4" />}
        title="No cases match your filters"
        description="The alert queue is clear for these criteria. Try widening your filters."
      />
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-3 font-medium">Case</th>
            <th className="px-6 py-3 font-medium">Priority</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Assignee</th>
            <th className="px-6 py-3 font-medium">Opened</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: rowCount }).map((_, i) => <SkeletonRow key={i} />)
            : rows.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.02 }}
                  onClick={() => onSelect(row)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(row);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open case ${row.reference}`}
                  className="border-t border-border cursor-pointer transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={row.transaction.customer.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {row.title}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {row.transaction.customer.name} ·{" "}
                          {formatCurrency(
                            row.transaction.amount,
                            row.transaction.currency,
                          )}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={riskTone[row.priority]} dot>
                      {riskLabel[row.priority]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={caseStatusTone[row.status]}>
                      {caseStatusLabel[row.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    {row.assignee ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar name={row.assignee} size="sm" />
                        <span className="text-foreground truncate">{row.assignee}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-foreground tabular-nums">
                      {formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })}
                    </p>
                  </td>
                </motion.tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-t border-border">
      <td className="px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-3.5"><Skeleton className="h-3 w-24" /></td>
      <td className="px-6 py-3.5"><Skeleton className="h-3 w-20" /></td>
    </tr>
  );
}
