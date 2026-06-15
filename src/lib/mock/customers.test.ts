import { describe, expect, it } from "vitest";
import { getCustomer, listCustomers, setKycStatus } from "./customers";
import { getMockTransactions } from "./data";
import type { RiskLevel } from "@/lib/types";

const RISK_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

describe("customer store — reads", () => {
  it("derives one record per unique customer", () => {
    const uniqueIds = new Set(getMockTransactions().map((t) => t.customer.id));
    const all = listCustomers({ pageSize: 50 });
    const summed = all.counts.verified + all.counts.pending + all.counts.rejected;
    expect(summed).toBe(uniqueIds.size);
  });

  it("aggregates a customer's transactions into the detail view", () => {
    const id = listCustomers({ pageSize: 1 }).data[0].id;
    const detail = getCustomer(id)!;
    const owned = getMockTransactions().filter((t) => t.customer.id === id);
    expect(detail.transactionCount).toBe(owned.length);
    const expectedVolume = Number(
      owned.reduce((sum, t) => sum + t.amount, 0).toFixed(2),
    );
    expect(detail.totalVolume).toBeCloseTo(expectedVolume, 2);
  });

  it("orders the directory by descending risk", () => {
    const { data } = listCustomers({ pageSize: 50 });
    for (let i = 1; i < data.length; i++) {
      expect(RISK_ORDER[data[i].riskLevel]).toBeGreaterThanOrEqual(
        RISK_ORDER[data[i - 1].riskLevel],
      );
    }
  });

  it("filters by KYC status", () => {
    const pending = listCustomers({ kyc: "pending", pageSize: 50 });
    expect(pending.data.every((c) => c.kycStatus === "pending")).toBe(true);
  });
});

describe("customer store — KYC mutations", () => {
  it("updates KYC status and records an audit entry", () => {
    const id = listCustomers({ pageSize: 1 }).data[0].id;
    const priorAudit = getCustomer(id)!.kycAudit.length;
    const updated = setKycStatus(id, "rejected", "tester")!;
    expect(updated.kycStatus).toBe("rejected");
    expect(updated.kycAudit.length).toBe(priorAudit + 1);
    expect(updated.kycAudit.at(-1)!.action).toContain("rejected");
  });

  it("returns null for an unknown customer", () => {
    expect(getCustomer("cus_nope")).toBeNull();
    expect(setKycStatus("cus_nope", "verified", "tester")).toBeNull();
  });
});
