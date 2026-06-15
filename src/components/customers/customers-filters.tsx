"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { KycStatus, RiskLevel } from "@/lib/types";

export interface CustomerFilters {
  search: string;
  kyc: KycStatus | "all";
  risk: RiskLevel | "all";
}

interface CustomersFiltersProps {
  value: CustomerFilters;
  onChange: (next: CustomerFilters) => void;
}

const kycOptions = [
  { value: "all", label: "All KYC statuses" },
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const riskOptions = [
  { value: "all", label: "All risk levels" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function CustomersFilters({ value, onChange }: CustomersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="sm:flex-1">
        <Input
          value={value.search}
          onChange={(e) => onChange({ ...value, search: e.target.value })}
          placeholder="Search by name, email, country..."
          leading={<Search className="h-4 w-4" />}
          aria-label="Search customers"
        />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:w-auto sm:flex">
        <Select
          aria-label="Filter by KYC status"
          options={kycOptions}
          value={value.kyc}
          onChange={(e) =>
            onChange({ ...value, kyc: e.target.value as CustomerFilters["kyc"] })
          }
          className="min-w-[160px]"
        />
        <Select
          aria-label="Filter by risk"
          options={riskOptions}
          value={value.risk}
          onChange={(e) =>
            onChange({ ...value, risk: e.target.value as CustomerFilters["risk"] })
          }
          className="min-w-[160px]"
        />
      </div>
    </div>
  );
}
