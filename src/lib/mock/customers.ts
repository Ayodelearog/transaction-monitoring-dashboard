import type {
  ActivityEvent,
  CustomerDetail,
  CustomerRecord,
  CustomersQuery,
  KycStatus,
  PaginatedCustomers,
  RiskLevel,
  Transaction,
} from "@/lib/types";
import { getMockTransactions, riskFromScore } from "./data";
import { getCasesByCustomer } from "./cases";

let event = 0;
function auditEvent(actor: string, action: string, detail?: string): ActivityEvent {
  event += 1;
  return { id: `kyc_evt_${event}`, at: new Date().toISOString(), actor, action, detail };
}

interface CustomerEntry {
  record: CustomerRecord;
}

function buildEntry(customerTxns: Transaction[]): CustomerEntry {
  const base = customerTxns[0].customer;
  const totalVolume = customerTxns.reduce((sum, t) => sum + t.amount, 0);
  const flaggedCount = customerTxns.filter(
    (t) => t.status === "flagged" || t.status === "review",
  ).length;
  const lastActivityAt = customerTxns
    .map((t) => t.createdAt)
    .sort()
    .at(-1)!;

  const record: CustomerRecord = {
    ...base,
    riskLevel: riskFromScore(base.riskScore),
    transactionCount: customerTxns.length,
    totalVolume: Number(totalVolume.toFixed(2)),
    flaggedCount,
    openCases: getCasesByCustomer(base.id).filter((c) => c.status !== "closed").length,
    lastActivityAt,
    kycAudit: [
      auditEvent(
        "onboarding",
        `KYC ${base.kycStatus}`,
        base.kycStatus === "verified"
          ? "Identity documents verified at onboarding."
          : base.kycStatus === "pending"
            ? "Awaiting document review."
            : "Verification rejected — escalate for manual review.",
      ),
    ],
  };
  return { record };
}

let store: Map<string, CustomerEntry> | null = null;

function db(): Map<string, CustomerEntry> {
  if (store) return store;
  const byCustomer = new Map<string, Transaction[]>();
  for (const t of getMockTransactions()) {
    const list = byCustomer.get(t.customer.id) ?? [];
    list.push(t);
    byCustomer.set(t.customer.id, list);
  }
  const map = new Map<string, CustomerEntry>();
  for (const [id, txns] of byCustomer) map.set(id, buildEntry(txns));
  store = map;
  return map;
}

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** Filter and sort the customer directory (no pagination). */
export function queryCustomers(query: CustomersQuery = {}): CustomerRecord[] {
  const { search = "", kyc = "all", risk = "all" } = query;
  const term = search.toLowerCase().trim();

  return [...db().values()]
    .map((e) => e.record)
    .filter((c) => {
      if (kyc !== "all" && c.kycStatus !== kyc) return false;
      if (risk !== "all" && c.riskLevel !== risk) return false;
      if (term) {
        const hay = `${c.name} ${c.email} ${c.country} ${c.id}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    })
    // Highest risk first, then largest volume.
    .sort((a, b) => {
      if (RISK_ORDER[a.riskLevel] !== RISK_ORDER[b.riskLevel]) {
        return RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
      }
      return b.totalVolume - a.totalVolume;
    });
}

export function listCustomers(query: CustomersQuery = {}): PaginatedCustomers {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, Math.min(50, query.pageSize ?? 10));

  const counts: Record<KycStatus, number> = { verified: 0, pending: 0, rejected: 0 };
  for (const e of db().values()) counts[e.record.kycStatus]++;

  const filtered = queryCustomers(query);
  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    counts,
  };
}

export function getCustomer(id: string): CustomerDetail | null {
  const entry = db().get(id);
  if (!entry) return null;
  const transactions = getMockTransactions()
    .filter((t) => t.customer.id === id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const cases = getCasesByCustomer(id);
  return {
    ...entry.record,
    kycAudit: [...entry.record.kycAudit],
    transactions,
    cases,
  };
}

/** Update a customer's KYC status and append to their audit trail. */
export function setKycStatus(id: string, status: KycStatus, actor: string) {
  const entry = db().get(id);
  if (!entry) return null;
  const prev = entry.record.kycStatus;
  entry.record.kycStatus = status;
  entry.record.kycAudit.push(
    auditEvent(actor, `KYC status changed to ${status}`, `Was ${prev}.`),
  );
  return getCustomer(id);
}
