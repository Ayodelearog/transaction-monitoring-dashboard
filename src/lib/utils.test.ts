import { describe, expect, it } from "vitest";
import { cn, formatCompact, formatCurrency, formatNumber, initials } from "./utils";

describe("cn", () => {
  it("merges class names and deduplicates conflicting Tailwind utilities", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", false && "text-lg", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatters", () => {
  it("formats currency in USD by default", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats currency in alternate currency", () => {
    const result = formatCurrency(1000, "EUR");
    expect(result).toContain("1,000");
  });

  it("formats compact numbers", () => {
    expect(formatCompact(1_500)).toBe("1.5K");
    expect(formatCompact(2_400_000)).toBe("2.4M");
  });

  it("formats plain numbers with thousands separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("initials", () => {
  it("uses the first letter of the first two name parts", () => {
    expect(initials("Ayodele Analyst")).toBe("AA");
    expect(initials("Single")).toBe("S");
    expect(initials("Three Word Name")).toBe("TW");
  });

  it("handles empty input safely", () => {
    expect(initials("")).toBe("");
  });
});
