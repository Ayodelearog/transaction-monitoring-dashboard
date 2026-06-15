import { format } from "date-fns";
import type { CaseRecord, CustomerRecord, Transaction } from "@/lib/types";
import type { CsvColumn } from "./csv";

const iso = (d: string) => format(new Date(d), "yyyy-MM-dd HH:mm");

export const transactionColumns: CsvColumn<Transaction>[] = [
  { header: "Reference", value: (t) => t.reference },
  { header: "Customer", value: (t) => t.customer.name },
  { header: "Customer ID", value: (t) => t.customer.id },
  { header: "Country", value: (t) => t.customer.country },
  { header: "Amount", value: (t) => t.amount },
  { header: "Currency", value: (t) => t.currency },
  { header: "Type", value: (t) => t.type },
  { header: "Channel", value: (t) => t.channel },
  { header: "Counterparty", value: (t) => t.counterparty },
  { header: "Status", value: (t) => t.status },
  { header: "Risk", value: (t) => t.risk },
  { header: "Risk score", value: (t) => t.riskScore },
  { header: "Created", value: (t) => iso(t.createdAt) },
];

export const caseColumns: CsvColumn<CaseRecord>[] = [
  { header: "Case ID", value: (c) => c.id },
  { header: "Reference", value: (c) => c.reference },
  { header: "Title", value: (c) => c.title },
  { header: "Customer", value: (c) => c.transaction.customer.name },
  { header: "Amount", value: (c) => c.transaction.amount },
  { header: "Priority", value: (c) => c.priority },
  { header: "Status", value: (c) => c.status },
  { header: "Disposition", value: (c) => c.disposition },
  { header: "Assignee", value: (c) => c.assignee ?? "" },
  { header: "Triggered rules", value: (c) => c.triggeredRules.map((r) => r.name).join("; ") },
  { header: "SAR status", value: (c) => c.sar?.status ?? "" },
  { header: "Opened", value: (c) => iso(c.createdAt) },
  { header: "Updated", value: (c) => iso(c.updatedAt) },
];

export const customerColumns: CsvColumn<CustomerRecord>[] = [
  { header: "Customer ID", value: (c) => c.id },
  { header: "Name", value: (c) => c.name },
  { header: "Email", value: (c) => c.email },
  { header: "Country", value: (c) => c.country },
  { header: "KYC status", value: (c) => c.kycStatus },
  { header: "Risk", value: (c) => c.riskLevel },
  { header: "Risk score", value: (c) => c.riskScore },
  { header: "Transactions", value: (c) => c.transactionCount },
  { header: "Total volume", value: (c) => c.totalVolume },
  { header: "Flagged", value: (c) => c.flaggedCount },
  { header: "Open cases", value: (c) => c.openCases },
  { header: "Customer since", value: (c) => format(new Date(c.joinedAt), "yyyy-MM-dd") },
];
