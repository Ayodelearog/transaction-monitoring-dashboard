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
