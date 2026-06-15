export type RiskLevel = "low" | "medium" | "high" | "critical";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "flagged"
  | "failed"
  | "review";

export type TransactionType =
  | "transfer"
  | "withdrawal"
  | "deposit"
  | "payment"
  | "refund";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  joinedAt: string;
  kycStatus: "verified" | "pending" | "rejected";
  riskScore: number;
}

export interface RiskIndicator {
  label: string;
  severity: RiskLevel;
  description: string;
}

export interface ActivityEvent {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail?: string;
}

export interface Transaction {
  id: string;
  reference: string;
  customer: Customer;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  risk: RiskLevel;
  riskScore: number;
  channel: "web" | "mobile" | "api" | "branch";
  counterparty: string;
  createdAt: string;
  indicators: RiskIndicator[];
  history: Array<{
    id: string;
    reference: string;
    amount: number;
    status: TransactionStatus;
    createdAt: string;
  }>;
  activity: ActivityEvent[];
}

export interface DashboardStats {
  totalTransactions: number;
  flaggedTransactions: number;
  totalCustomers: number;
  averageRiskScore: number;
  flaggedTrend: number;
  transactionsTrend: number;
  customersTrend: number;
  riskTrend: number;
  riskDistribution: Array<{ level: RiskLevel; count: number }>;
  weeklyVolume: Array<{ day: string; transactions: number; flagged: number }>;
}

export interface PaginatedTransactions {
  data: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionsQuery {
  search?: string;
  status?: TransactionStatus | "all";
  risk?: RiskLevel | "all";
  page?: number;
  pageSize?: number;
}

export type CaseStatus = "open" | "investigating" | "escalated" | "closed";

export type CaseDisposition =
  | "unreviewed"
  | "cleared"
  | "false_positive"
  | "sar_filed";

export interface CaseNote {
  id: string;
  author: string;
  body: string;
  at: string;
}

export interface SarReport {
  id: string;
  narrative: string;
  draftedBy: "ai" | "analyst";
  status: "draft" | "approved";
  createdAt: string;
}

/** A compliance case opened against a suspicious transaction. */
export interface Case {
  id: string;
  transactionId: string;
  reference: string;
  title: string;
  summary: string;
  status: CaseStatus;
  /** Mirrors the originating transaction's risk level. */
  priority: RiskLevel;
  disposition: CaseDisposition;
  assignee: string | null;
  notes: CaseNote[];
  audit: ActivityEvent[];
  sar: SarReport | null;
  createdAt: string;
  updatedAt: string;
}

/** A case joined with its originating transaction, as served by the API. */
export interface CaseRecord extends Case {
  transaction: Transaction;
}

export interface CasesQuery {
  search?: string;
  status?: CaseStatus | "all";
  priority?: RiskLevel | "all";
  page?: number;
  pageSize?: number;
}

export interface PaginatedCases {
  data: CaseRecord[];
  total: number;
  page: number;
  pageSize: number;
  /** Total cases per status across the whole queue, for the KPI tiles. */
  counts: Record<CaseStatus, number>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "analyst";
  avatarColor: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}
