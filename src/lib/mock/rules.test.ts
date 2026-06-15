import { describe, expect, it } from "vitest";
import {
  evaluateTransaction,
  getRule,
  listRules,
  rulesCoverage,
  updateRule,
} from "./rules";
import type { Customer, Transaction } from "@/lib/types";

const customer: Customer = {
  id: "cus_test",
  name: "Test Subject",
  email: "test@example.com",
  phone: "+2348000000000",
  country: "NG",
  joinedAt: "2025-01-01T00:00:00.000Z",
  kycStatus: "verified",
  riskScore: 50,
};

function makeTxn(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "txn_test",
    reference: "TXN999999",
    customer,
    amount: 100,
    currency: "USD",
    type: "transfer",
    status: "completed",
    risk: "low",
    riskScore: 10,
    channel: "web",
    counterparty: "Paystack",
    createdAt: "2026-05-01T00:00:00.000Z",
    indicators: [],
    history: [],
    activity: [],
    ...overrides,
  };
}

describe("rules engine — evaluation", () => {
  it("fires the large-transfer rule above its threshold and not below", () => {
    const big = evaluateTransaction(makeTxn({ amount: 80_000 }));
    expect(big.map((m) => m.ruleId)).toContain("large-transfer");

    const small = evaluateTransaction(makeTxn({ amount: 200 }));
    expect(small.map((m) => m.ruleId)).not.toContain("large-transfer");
  });

  it("fires structuring only for amounts just below $10k", () => {
    expect(
      evaluateTransaction(makeTxn({ amount: 9_500 })).map((m) => m.ruleId),
    ).toContain("structuring");
    expect(
      evaluateTransaction(makeTxn({ amount: 10_500 })).map((m) => m.ruleId),
    ).not.toContain("structuring");
  });

  it("fires unverified-high-value only for unverified customers", () => {
    const unverified = makeTxn({
      amount: 9_000,
      customer: { ...customer, kycStatus: "pending" },
    });
    expect(evaluateTransaction(unverified).map((m) => m.ruleId)).toContain(
      "unverified-high-value",
    );
    expect(
      evaluateTransaction(makeTxn({ amount: 9_000 })).map((m) => m.ruleId),
    ).not.toContain("unverified-high-value");
  });

  it("skips disabled rules", () => {
    updateRule("large-transfer", { enabled: false });
    const matches = evaluateTransaction(makeTxn({ amount: 80_000 }));
    expect(matches.map((m) => m.ruleId)).not.toContain("large-transfer");
    updateRule("large-transfer", { enabled: true }); // restore
  });
});

describe("rules engine — catalog & config", () => {
  it("lists rules with non-negative match counts", () => {
    const rules = listRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.every((r) => r.matchCount >= 0)).toBe(true);
  });

  it("reports coverage within the dataset bounds", () => {
    const coverage = rulesCoverage();
    expect(coverage).toBeGreaterThanOrEqual(0);
  });

  it("lowering a threshold does not decrease its match count", () => {
    const before = getRule("large-transfer")!;
    const updated = updateRule("large-transfer", { threshold: 1_000 })!;
    expect(updated.matchCount).toBeGreaterThanOrEqual(before.matchCount);
    updateRule("large-transfer", { threshold: before.threshold }); // restore
  });

  it("returns null for an unknown rule", () => {
    expect(getRule("nope")).toBeNull();
    expect(updateRule("nope", { enabled: false })).toBeNull();
  });
});
