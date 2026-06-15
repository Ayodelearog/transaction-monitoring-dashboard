import { describe, expect, it } from "vitest";
import {
  addCaseNote,
  assignCase,
  escalateCase,
  getCase,
  listCases,
  setCaseStatus,
} from "./cases";
import type { RiskLevel } from "@/lib/types";

const PRIORITY_ORDER: Record<RiskLevel, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

describe("case store — reads", () => {
  it("derives a non-empty queue with status counts that sum to the total", () => {
    const all = listCases({ pageSize: 50 });
    expect(all.total).toBeGreaterThan(0);
    const summed =
      all.counts.open +
      all.counts.investigating +
      all.counts.escalated +
      all.counts.closed;
    expect(summed).toBe(all.total);
  });

  it("joins each case with its originating transaction", () => {
    const { data } = listCases({ pageSize: 5 });
    for (const record of data) {
      expect(record.transaction.id).toBe(record.transactionId);
      expect(record.priority).toBe(record.transaction.risk);
    }
  });

  it("orders the queue by descending priority", () => {
    const { data } = listCases({ pageSize: 50 });
    for (let i = 1; i < data.length; i++) {
      expect(PRIORITY_ORDER[data[i].priority]).toBeGreaterThanOrEqual(
        PRIORITY_ORDER[data[i - 1].priority],
      );
    }
  });

  it("filters by status", () => {
    const open = listCases({ status: "open", pageSize: 50 });
    expect(open.data.every((c) => c.status === "open")).toBe(true);
  });
});

describe("case store — mutations", () => {
  function firstCaseId() {
    return listCases({ pageSize: 1 }).data[0].id;
  }

  it("closing an unreviewed case auto-clears it and records an audit entry", () => {
    const id = listCases({ status: "open", pageSize: 50 }).data[0].id;
    const before = getCase(id)!;
    const priorDisposition = before.disposition;
    const priorAudit = before.audit.length;
    const updated = setCaseStatus(id, "closed", "tester")!;
    expect(updated.status).toBe("closed");
    if (priorDisposition === "unreviewed") {
      expect(updated.disposition).toBe("cleared");
    }
    expect(updated.audit.length).toBe(priorAudit + 1);
    expect(updated.audit.at(-1)!.action).toContain("closed");
  });

  it("adds a note and an accompanying audit event", () => {
    const id = firstCaseId();
    const priorNotes = getCase(id)!.notes.length;
    const updated = addCaseNote(id, "Reviewed counterparty history.", "tester")!;
    expect(updated.notes.length).toBe(priorNotes + 1);
    expect(updated.notes.at(-1)!.body).toBe("Reviewed counterparty history.");
    expect(updated.audit.at(-1)!.action).toBe("Note added");
  });

  it("escalating sets the SAR disposition and escalated status", () => {
    const id = firstCaseId();
    const updated = escalateCase(id, "tester")!;
    expect(updated.status).toBe("escalated");
    expect(updated.disposition).toBe("sar_filed");
  });

  it("assigns and unassigns an owner", () => {
    const id = firstCaseId();
    expect(assignCase(id, "Chinwe Okafor", "tester")!.assignee).toBe("Chinwe Okafor");
    expect(assignCase(id, null, "tester")!.assignee).toBeNull();
  });

  it("returns null for an unknown case", () => {
    expect(getCase("case_does_not_exist")).toBeNull();
    expect(setCaseStatus("case_does_not_exist", "open", "tester")).toBeNull();
  });
});
