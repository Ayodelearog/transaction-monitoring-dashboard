"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CaseStatus, RiskLevel } from "@/lib/types";

export interface AlertFilters {
  search: string;
  status: CaseStatus | "all";
  priority: RiskLevel | "all";
}

interface AlertsFiltersProps {
  value: AlertFilters;
  onChange: (next: AlertFilters) => void;
}

const statusOptions = [
  { value: "all", label: "All statuses" },
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "escalated", label: "Escalated" },
  { value: "closed", label: "Closed" },
];

const priorityOptions = [
  { value: "all", label: "All priorities" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function AlertsFilters({ value, onChange }: AlertsFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="sm:flex-1">
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search by reference, customer, assignee..."
          leading={<Search className="h-4 w-4" />}
          aria-label="Search cases"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:w-auto sm:flex">
        <Select
          aria-label="Filter by status"
          options={statusOptions}
          value={value.status}
          onChange={(e) =>
            onChange({ ...value, status: e.target.value as AlertFilters["status"] })
          }
          className="min-w-[160px]"
        />
        <Select
          aria-label="Filter by priority"
          options={priorityOptions}
          value={value.priority}
          onChange={(e) =>
            onChange({ ...value, priority: e.target.value as AlertFilters["priority"] })
          }
          className="min-w-[160px]"
        />
      </div>
    </div>
  );
}
