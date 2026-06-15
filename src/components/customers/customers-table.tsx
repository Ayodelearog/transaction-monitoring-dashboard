"use client";

import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { CustomerRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { kycLabel, kycTone, riskLabel, riskTone } from "@/lib/ui-mappings";

interface CustomersTableProps {
  rows: CustomerRecord[];
  loading: boolean;
  rowCount?: number;
  onSelect: (record: CustomerRecord) => void;
}

export function CustomersTable({
  rows,
  loading,
  rowCount = 8,
  onSelect,
}: CustomersTableProps) {
  if (!loading && rows.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-4 w-4" />}
        title="No customers match your filters"
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
            <th className="px-6 py-3 font-medium">KYC</th>
            <th className="px-6 py-3 font-medium">Risk</th>
            <th className="px-6 py-3 font-medium">Volume</th>
            <th className="px-6 py-3 font-medium">Cases</th>
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
                  aria-label={`View ${row.name}`}
                  className="border-t border-border cursor-pointer transition-colors hover:bg-muted/60 focus:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={row.name} size="sm" />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{row.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {row.email} · {row.country}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={kycTone[row.kycStatus]}>{kycLabel[row.kycStatus]}</Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <Badge tone={riskTone[row.riskLevel]} dot>
                      {riskLabel[row.riskLevel]} · {row.riskScore}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(row.totalVolume, "USD")}
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {row.transactionCount} txns
                    </p>
                  </td>
                  <td className="px-6 py-3.5">
                    {row.openCases > 0 ? (
                      <Badge tone="danger">{row.openCases} open</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
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
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-2.5 w-28" />
          </div>
        </div>
      </td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-16 rounded-full" /></td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-20 rounded-full" /></td>
      <td className="px-6 py-3.5 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-2.5 w-12" />
      </td>
      <td className="px-6 py-3.5"><Skeleton className="h-5 w-14 rounded-full" /></td>
    </tr>
  );
}
