"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { RiskLevel, TransactionStatus } from "@/lib/types";

interface Filters {
  search: string;
  status: TransactionStatus | "all";
  risk: RiskLevel | "all";
}

interface TransactionsFiltersProps {
  value: Filters;
  onChange: (next: Filters) => void;
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "review", label: "Under review" },
  { value: "failed", label: "Failed" },
];

const riskOptions = [
  { value: "all", label: "All risk levels" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

export function TransactionsFilters({ value, onChange }: TransactionsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="sm:flex-1">
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search by customer, reference, counterparty..."
          leading={<Search className="h-4 w-4" />}
          aria-label="Search transactions"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:w-auto sm:flex">
        <Select
          aria-label="Filter by status"
          options={statusOptions}
          value={value.status}
          onChange={(e) =>
            onChange({ ...value, status: e.target.value as Filters["status"] })
          }
          className="min-w-[160px]"
        />
        <Select
          aria-label="Filter by risk"
          options={riskOptions}
          value={value.risk}
          onChange={(e) =>
            onChange({ ...value, risk: e.target.value as Filters["risk"] })
          }
          className="min-w-[160px]"
        />
      </div>
    </div>
  );
}
