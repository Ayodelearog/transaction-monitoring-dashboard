import { describe, expect, it } from "vitest";
import { SeededRng } from "./seed";
import { getMockStats, getMockTransactions } from "./data";

describe("SeededRng", () => {
  it("produces deterministic sequences for the same seed", () => {
    const a = new SeededRng(123);
    const b = new SeededRng(123);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it("produces different sequences for different seeds", () => {
    const a = new SeededRng(1);
    const b = new SeededRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it("int() stays within the requested range", () => {
    const rng = new SeededRng(42);
    for (let i = 0; i < 200; i++) {
      const value = rng.int(10, 20);
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(20);
    }
  });
});

describe("mock data", () => {
  it("returns a stable set of transactions", () => {
    const first = getMockTransactions();
    const second = getMockTransactions();
    expect(first.length).toBeGreaterThan(0);
    expect(first[0].id).toBe(second[0].id);
  });

  it("derives a coherent stats payload", () => {
    const stats = getMockStats();
    expect(stats.totalTransactions).toBeGreaterThan(0);
    expect(stats.riskDistribution.map((r) => r.level)).toEqual([
      "low",
      "medium",
      "high",
      "critical",
    ]);
    const sum = stats.riskDistribution.reduce((acc, r) => acc + r.count, 0);
    expect(sum).toBe(getMockTransactions().length);
  });
});
