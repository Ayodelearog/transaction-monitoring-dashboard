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

export type KycStatus = "verified" | "pending" | "rejected";

export type RuleCategory =
  | "amount"
  | "velocity"
  | "geography"
  | "counterparty"
  | "behavior"
  | "kyc";

/** A configurable detection rule in the monitoring engine. */
export interface DetectionRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  /** Risk contribution when the rule fires. */
  severity: RiskLevel;
  enabled: boolean;
  /** Optional tunable threshold (e.g. amount in USD, txns per window). */
  threshold?: number;
  thresholdUnit?: string;
  thresholdLabel?: string;
  /** Rationale surfaced when the rule fires against a transaction. */
  rationale: string;
}

/** A rule's metadata plus how many transactions it currently matches. */
export interface DetectionRuleWithMatches extends DetectionRule {
  matchCount: number;
}

/** A rule that fired against a specific transaction. */
export interface RuleMatch {
  ruleId: string;
  name: string;
  category: RuleCategory;
  severity: RiskLevel;
  rationale: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  joinedAt: string;
  kycStatus: KycStatus;
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
  /** Detection rules the linked transaction currently triggers. */
  triggeredRules: RuleMatch[];
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

/** A customer enriched with portfolio aggregates and a KYC audit trail. */
export interface CustomerRecord extends Customer {
  riskLevel: RiskLevel;
  transactionCount: number;
  totalVolume: number;
  flaggedCount: number;
  openCases: number;
  lastActivityAt: string;
  kycAudit: ActivityEvent[];
}

/** Customer detail joined with their transactions and linked cases. */
export interface CustomerDetail extends CustomerRecord {
  transactions: Transaction[];
  cases: Case[];
}

export interface CustomersQuery {
  search?: string;
  kyc?: KycStatus | "all";
  risk?: RiskLevel | "all";
  page?: number;
  pageSize?: number;
}

export interface PaginatedCustomers {
  data: CustomerRecord[];
  total: number;
  page: number;
  pageSize: number;
  /** Total customers per KYC status across the whole base, for the KPI tiles. */
  counts: Record<KycStatus, number>;
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
