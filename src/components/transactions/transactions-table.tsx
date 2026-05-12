"use client";

import { format } from "date-fns";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";
import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { riskLabel, riskTone, statusLabel, statusTone } from "@/lib/ui-mappings";

interface TransactionsTableProps {
  rows: Transaction[];
  loading: boolean;
  rowCount?: number;
  onSelect: (transaction: Transaction) => void;
}

export function TransactionsTable({
  rows,
  loading,
  rowCount = 8,
  onSelect,
}: TransactionsTableProps) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<Receipt className="h-4 w-4" />}
        title="No transactions match your filters"
        description="Try adjusting your search query or clearing filters to see more results."
      />
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="px-6 py-3 font-medium">Customer</th>
            <th className="px-6 py-3 font-medium">Amount</th>
            <th className="px-6 py-3 font-medium">Risk</th>
            <th className="px-6 py-3 font-medium">Status</th>
            <th className="px-6 py-3 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: rowCount }).map((_, i) => (
                <SkeletonRow key={i} />
              ))
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
                  aria-label={`View details for ${row.reference}`}
                  className="border-t border-border cursor-pointer transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={row.customer.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {row.customer.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {row.reference} · {row.counterparty}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(row.amount, row.currency)}
                    </p>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {row.type} · {row.channel}
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={riskTone[row.risk]} dot>
                      {riskLabel[row.risk]} · {row.riskScore}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={statusTone[row.status]}>
                      {statusLabel[row.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-foreground tabular-nums">
                      {format(new Date(row.createdAt), "MMM d, yyyy")}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {format(new Date(row.createdAt), "h:mm a")}
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
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2.5 w-16" />
      </td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-3.5 space-y-1.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-2.5 w-16" />
      </td>
    </tr>
  );
}
