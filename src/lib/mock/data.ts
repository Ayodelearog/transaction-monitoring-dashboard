import type {
  ActivityEvent,
  Customer,
  DashboardStats,
  RiskIndicator,
  RiskLevel,
  Transaction,
  TransactionStatus,
  TransactionType,
} from "@/lib/types";
import { SeededRng } from "./seed";

const FIRST_NAMES = [
  "Ayodele", "Chinwe", "Tunde", "Amara", "Bisi", "Femi", "Ngozi", "Kola",
  "Aisha", "Emeka", "Funmi", "Lola", "Seyi", "Tobi", "Yetunde", "Obinna",
  "Olamide", "Zainab", "Kemi", "Ifeanyi", "Dami", "Halima", "Sade", "Nnamdi",
];

const LAST_NAMES = [
  "Okafor", "Adeyemi", "Bello", "Eze", "Mohammed", "Ogundipe", "Williams",
  "Onyeka", "Achebe", "Balogun", "Chukwu", "Diallo", "Egwu", "Femi-Cole",
  "Garba", "Ibrahim", "Jegede", "Lawal", "Mensah", "Nwosu",
];

const COUNTRIES = ["NG", "GH", "KE", "ZA", "UK", "US", "DE", "AE"];

const COUNTERPARTIES = [
  "Paystack",
  "Flutterwave",
  "Wema Bank",
  "Stripe Inc.",
  "Binance",
  "Wise",
  "GTBank",
  "Coinbase",
  "Remitly",
  "Stanbic IBTC",
  "Access Bank",
  "Revolut",
];

const RISK_PHRASES: Record<RiskLevel, RiskIndicator[]> = {
  low: [
    {
      label: "Whitelisted counterparty",
      severity: "low",
      description: "Counterparty has a consistent transaction history.",
    },
    {
      label: "Verified KYC",
      severity: "low",
      description: "Customer has completed full identity verification.",
    },
  ],
  medium: [
    {
      label: "Unusual hour",
      severity: "medium",
      description: "Transaction initiated outside customer's typical activity window.",
    },
    {
      label: "New device",
      severity: "medium",
      description: "Authenticated from a device not seen in the last 30 days.",
    },
  ],
  high: [
    {
      label: "Velocity anomaly",
      severity: "high",
      description: "More than 5 transfers initiated in the last hour.",
    },
    {
      label: "Geo mismatch",
      severity: "high",
      description: "IP origin differs from registered country of residence.",
    },
  ],
  critical: [
    {
      label: "Sanctioned counterparty",
      severity: "critical",
      description: "Counterparty appears on a global watchlist.",
    },
    {
      label: "Structuring pattern",
      severity: "critical",
      description: "Sequential transfers just below the reporting threshold.",
    },
  ],
};

const STATUS_OPTIONS: TransactionStatus[] = [
  "completed",
  "pending",
  "flagged",
  "failed",
  "review",
];

const TYPE_OPTIONS: TransactionType[] = [
  "transfer",
  "withdrawal",
  "deposit",
  "payment",
  "refund",
];

const CHANNELS = ["web", "mobile", "api", "branch"] as const;

const ANCHOR_DATE = new Date("2026-05-12T12:00:00Z").getTime();

export function riskFromScore(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function buildCustomer(rng: SeededRng, index: number): Customer {
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);
  const name = `${first} ${last}`;
  const score = rng.int(5, 99);
  const joined = new Date(ANCHOR_DATE - rng.int(30, 900) * 86_400_000);
  return {
    id: `cus_${1000 + index}`,
    name,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+234${rng.int(7000000000, 9099999999)}`,
    country: rng.pick(COUNTRIES),
    joinedAt: joined.toISOString(),
    kycStatus: rng.pick(["verified", "verified", "verified", "pending", "rejected"]),
    riskScore: score,
  };
}

function buildHistory(rng: SeededRng, count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `txn_h_${rng.int(10000, 99999)}_${i}`,
    reference: `TXN${rng.int(100000, 999999)}`,
    amount: Number((rng.next() * 25000 + 50).toFixed(2)),
    status: rng.pick(STATUS_OPTIONS),
    createdAt: new Date(ANCHOR_DATE - rng.int(1, 180) * 86_400_000).toISOString(),
  }));
}

function buildActivity(rng: SeededRng, transactionRef: string): ActivityEvent[] {
  const base = ANCHOR_DATE - rng.int(0, 6) * 3600_000;
  const events: ActivityEvent[] = [
    {
      id: `evt_${rng.int(1000, 9999)}_1`,
      at: new Date(base - 1000 * 60 * 12).toISOString(),
      actor: "system",
      action: "Transaction initiated",
      detail: `Reference ${transactionRef} created via API.`,
    },
    {
      id: `evt_${rng.int(1000, 9999)}_2`,
      at: new Date(base - 1000 * 60 * 8).toISOString(),
      actor: "rules-engine",
      action: "Risk scoring complete",
      detail: "Applied 14 active rule checks.",
    },
    {
      id: `evt_${rng.int(1000, 9999)}_3`,
      at: new Date(base - 1000 * 60 * 4).toISOString(),
      actor: "monitor",
      action: "Watchlist screening",
      detail: "Counterparty matched against global sanction lists.",
    },
    {
      id: `evt_${rng.int(1000, 9999)}_4`,
      at: new Date(base).toISOString(),
      actor: "analyst@smartcomply",
      action: "Case assigned",
      detail: "Routed to AML review queue.",
    },
  ];
  return events;
}

function generateTransaction(
  index: number,
  rng: SeededRng,
  pool: Customer[],
): Transaction {
  // Draw from a shared customer pool so customers recur across transactions —
  // this is what makes per-customer aggregates and velocity rules meaningful.
  const customer = rng.pick(pool);
  const score = rng.int(1, 99);
  const risk = riskFromScore(score);
  const status = (() => {
    if (risk === "critical") return rng.pick<TransactionStatus>(["flagged", "review", "failed"]);
    if (risk === "high") return rng.pick<TransactionStatus>(["flagged", "review", "pending"]);
    if (risk === "medium") return rng.pick<TransactionStatus>(["pending", "completed", "review"]);
    return rng.pick<TransactionStatus>(["completed", "completed", "pending"]);
  })();
  const amount = Number(
    (rng.next() * (risk === "critical" ? 200_000 : 25_000) + 50).toFixed(2),
  );
  const reference = `TXN${rng.int(100000, 999999)}`;
  const createdAt = new Date(ANCHOR_DATE - rng.int(0, 30) * 86_400_000 - rng.int(0, 86_400_000)).toISOString();

  return {
    id: `txn_${index}`,
    reference,
    customer,
    amount,
    currency: "USD",
    type: rng.pick(TYPE_OPTIONS),
    status,
    risk,
    riskScore: score,
    channel: rng.pick(CHANNELS),
    counterparty: rng.pick(COUNTERPARTIES),
    createdAt,
    indicators: RISK_PHRASES[risk],
    history: buildHistory(rng, rng.int(2, 5)),
    activity: buildActivity(rng, reference),
  };
}

let cache: { generatedAt: number; transactions: Transaction[] } | null = null;

export function getMockTransactions(): Transaction[] {
  if (cache) return cache.transactions;
  const rng = new SeededRng(424242);
  // ~36 customers across 84 transactions → an average of >2 each, so some
  // customers cluster into high-velocity, multi-transaction profiles.
  const pool = Array.from({ length: 36 }, (_, i) => buildCustomer(rng, i));
  const transactions = Array.from({ length: 84 }, (_, i) =>
    generateTransaction(i, rng, pool),
  );
  cache = { generatedAt: Date.now(), transactions };
  return transactions;
}

export function getMockStats(): DashboardStats {
  const transactions = getMockTransactions();
  const flagged = transactions.filter((t) => t.status === "flagged" || t.status === "review").length;
  const uniqueCustomers = new Set(transactions.map((t) => t.customer.id)).size;
  const averageRiskScore = Math.round(
    transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length,
  );

  const riskBuckets: Record<RiskLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  for (const t of transactions) riskBuckets[t.risk]++;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const jitter = new SeededRng(98765);
  const weeklyVolume = days.map((day) => {
    const transactionsCount = jitter.int(180, 460);
    const flaggedCount = Math.round(transactionsCount * (jitter.next() * 0.18 + 0.05));
    return { day, transactions: transactionsCount, flagged: flaggedCount };
  });

  return {
    totalTransactions: transactions.length * 142,
    flaggedTransactions: flagged * 12,
    totalCustomers: uniqueCustomers * 27,
    averageRiskScore,
    flaggedTrend: 4.8,
    transactionsTrend: 12.3,
    customersTrend: 7.1,
    riskTrend: -2.4,
    riskDistribution: (Object.keys(riskBuckets) as RiskLevel[]).map((level) => ({
      level,
      count: riskBuckets[level],
    })),
    weeklyVolume,
  };
}
