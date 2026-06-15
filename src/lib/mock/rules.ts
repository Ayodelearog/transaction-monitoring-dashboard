import type {
  DetectionRule,
  DetectionRuleWithMatches,
  RuleMatch,
  Transaction,
} from "@/lib/types";
import { getMockTransactions } from "./data";

/** Jurisdictions under enhanced monitoring in this demo. */
const HIGH_RISK_COUNTRIES = new Set(["AE", "KE"]);
/** Counterparties under enhanced scrutiny in this demo. */
const WATCHLISTED_COUNTERPARTIES = new Set(["Binance"]);

interface EvalContext {
  customerTxnCount: number;
}

/** Static rule definition: metadata, defaults, and the matching predicate. */
interface RuleDef extends DetectionRule {
  test: (txn: Transaction, rule: DetectionRule, ctx: EvalContext) => boolean;
}

const CATALOG: RuleDef[] = [
  {
    id: "large-transfer",
    name: "Large transfer",
    description: "Single transaction at or above the reporting threshold.",
    category: "amount",
    severity: "high",
    enabled: true,
    threshold: 50_000,
    thresholdUnit: "USD",
    thresholdLabel: "Amount ≥",
    rationale: "Transaction value meets the large-transfer reporting threshold.",
    test: (t, r) => t.amount >= (r.threshold ?? 50_000),
  },
  {
    id: "structuring",
    name: "Structuring pattern",
    description: "Amount sits just below the $10,000 reporting threshold.",
    category: "behavior",
    severity: "critical",
    enabled: true,
    rationale: "Value just under the $10k threshold is consistent with structuring.",
    test: (t) => t.amount >= 8_500 && t.amount < 10_000,
  },
  {
    id: "high-risk-jurisdiction",
    name: "High-risk jurisdiction",
    description: "Customer is registered in a jurisdiction under enhanced monitoring.",
    category: "geography",
    severity: "high",
    enabled: true,
    rationale: "Customer's country of residence is on the enhanced-monitoring list.",
    test: (t) => HIGH_RISK_COUNTRIES.has(t.customer.country),
  },
  {
    id: "watchlisted-counterparty",
    name: "Watchlisted counterparty",
    description: "Counterparty appears on the enhanced-scrutiny watchlist.",
    category: "counterparty",
    severity: "critical",
    enabled: true,
    rationale: "Counterparty is on the watchlist and requires manual review.",
    test: (t) => WATCHLISTED_COUNTERPARTIES.has(t.counterparty),
  },
  {
    id: "unverified-high-value",
    name: "Unverified high-value",
    description: "High-value transaction from a customer without verified KYC.",
    category: "kyc",
    severity: "high",
    enabled: true,
    threshold: 5_000,
    thresholdUnit: "USD",
    thresholdLabel: "Amount ≥",
    rationale: "Customer has not completed KYC for a transaction of this size.",
    test: (t, r) =>
      t.customer.kycStatus !== "verified" && t.amount >= (r.threshold ?? 5_000),
  },
  {
    id: "rapid-velocity",
    name: "Rapid velocity",
    description: "Customer has an unusually high number of transactions.",
    category: "velocity",
    severity: "medium",
    enabled: true,
    threshold: 4,
    thresholdUnit: "txns",
    thresholdLabel: "Count ≥",
    rationale: "Customer transaction count exceeds the velocity threshold.",
    test: (_t, r, ctx) => ctx.customerTxnCount >= (r.threshold ?? 4),
  },
  {
    id: "automated-high-value",
    name: "Automated high-value transfer",
    description: "Large transaction initiated through the API channel.",
    category: "behavior",
    severity: "medium",
    enabled: false,
    threshold: 25_000,
    thresholdUnit: "USD",
    thresholdLabel: "Amount ≥",
    rationale: "High-value transfer initiated programmatically via the API channel.",
    test: (t, r) => t.channel === "api" && t.amount >= (r.threshold ?? 25_000),
  },
];

const TEST_BY_ID = new Map(CATALOG.map((r) => [r.id, r.test]));

function toRule(def: RuleDef): DetectionRule {
  const { test: _test, ...rule } = def;
  void _test;
  return { ...rule };
}

let store: Map<string, DetectionRule> | null = null;

function db(): Map<string, DetectionRule> {
  if (store) return store;
  store = new Map(CATALOG.map((def) => [def.id, toRule(def)]));
  return store;
}

let customerCounts: Map<string, number> | null = null;
function counts(): Map<string, number> {
  if (customerCounts) return customerCounts;
  const map = new Map<string, number>();
  for (const t of getMockTransactions()) {
    map.set(t.customer.id, (map.get(t.customer.id) ?? 0) + 1);
  }
  customerCounts = map;
  return map;
}

/** Evaluate the enabled rules against a transaction, returning every match. */
export function evaluateTransaction(txn: Transaction): RuleMatch[] {
  const ctx: EvalContext = {
    customerTxnCount: counts().get(txn.customer.id) ?? 0,
  };
  const matches: RuleMatch[] = [];
  for (const rule of db().values()) {
    if (!rule.enabled) continue;
    const test = TEST_BY_ID.get(rule.id);
    if (test && test(txn, rule, ctx)) {
      matches.push({
        ruleId: rule.id,
        name: rule.name,
        category: rule.category,
        severity: rule.severity,
        rationale: rule.rationale,
      });
    }
  }
  return matches;
}

function matchCount(rule: DetectionRule): number {
  const test = TEST_BY_ID.get(rule.id);
  if (!test) return 0;
  let n = 0;
  for (const t of getMockTransactions()) {
    const ctx: EvalContext = { customerTxnCount: counts().get(t.customer.id) ?? 0 };
    if (test(t, rule, ctx)) n += 1;
  }
  return n;
}

export function listRules(): DetectionRuleWithMatches[] {
  return [...db().values()].map((rule) => ({ ...rule, matchCount: matchCount(rule) }));
}

/** Number of transactions caught by at least one enabled rule. */
export function rulesCoverage(): number {
  return getMockTransactions().filter((t) => evaluateTransaction(t).length > 0).length;
}

export function getRule(id: string): DetectionRuleWithMatches | null {
  const rule = db().get(id);
  return rule ? { ...rule, matchCount: matchCount(rule) } : null;
}

export function updateRule(
  id: string,
  patch: { enabled?: boolean; threshold?: number },
): DetectionRuleWithMatches | null {
  const rule = db().get(id);
  if (!rule) return null;
  if (patch.enabled !== undefined) rule.enabled = patch.enabled;
  if (patch.threshold !== undefined && rule.threshold !== undefined) {
    rule.threshold = Math.max(0, patch.threshold);
  }
  return getRule(id);
}
