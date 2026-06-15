import type {
  ActivityEvent,
  Case,
  CaseDisposition,
  CaseRecord,
  CasesQuery,
  CaseStatus,
  PaginatedCases,
  RiskLevel,
  SarReport,
  Transaction,
} from "@/lib/types";
import { getMockTransactions } from "./data";
import { SeededRng } from "./seed";

const ANALYSTS = [
  "Ayodele Analyst",
  "Chinwe Okafor",
  "Tunde Bello",
  null,
] as const;

let event = 0;
function nextEventId() {
  event += 1;
  return `cevt_${event}`;
}

function auditEvent(
  actor: string,
  action: string,
  detail?: string,
  at: string = new Date().toISOString(),
): ActivityEvent {
  return { id: nextEventId(), at, actor, action, detail };
}

/** A transaction warrants a case when it is flagged/under review, or high-risk. */
function warrantsCase(t: Transaction): boolean {
  return (
    t.status === "flagged" ||
    t.status === "review" ||
    t.risk === "high" ||
    t.risk === "critical"
  );
}

function summarize(t: Transaction): string {
  const top = t.indicators[0];
  const lead = top ? top.label.toLowerCase() : "anomalous activity";
  return `${t.customer.name}'s ${t.type} to ${t.counterparty} triggered ${lead}.`;
}

function seedStatus(rng: SeededRng, risk: RiskLevel): CaseStatus {
  if (risk === "critical")
    return rng.pick<CaseStatus>(["escalated", "investigating", "open"]);
  if (risk === "high")
    return rng.pick<CaseStatus>(["investigating", "open", "open"]);
  return rng.pick<CaseStatus>(["open", "open", "closed"]);
}

function buildCase(t: Transaction, rng: SeededRng): Case {
  const status = seedStatus(rng, t.risk);
  const assignee =
    status === "open" ? rng.pick(ANALYSTS) : rng.pick(ANALYSTS.slice(0, 3));
  const openedAt = new Date(
    new Date(t.createdAt).getTime() + rng.int(2, 90) * 60_000,
  ).toISOString();

  const audit: ActivityEvent[] = [
    auditEvent(
      "rules-engine",
      "Case opened",
      `Auto-generated from ${t.reference} (risk ${t.riskScore}).`,
      openedAt,
    ),
  ];
  if (assignee) {
    audit.push(
      auditEvent(
        "monitor",
        "Case assigned",
        `Routed to ${assignee}.`,
        new Date(new Date(openedAt).getTime() + rng.int(1, 30) * 60_000).toISOString(),
      ),
    );
  }
  if (status === "investigating" || status === "escalated") {
    audit.push(
      auditEvent(
        assignee ?? "system",
        "Status changed to investigating",
        undefined,
        new Date(new Date(openedAt).getTime() + rng.int(31, 120) * 60_000).toISOString(),
      ),
    );
  }

  const disposition: CaseDisposition =
    status === "closed" ? "false_positive" : "unreviewed";

  return {
    id: `case_${t.id.replace("txn_", "")}`,
    transactionId: t.id,
    reference: t.reference,
    title: `Suspicious ${t.type} · ${t.reference}`,
    summary: summarize(t),
    status,
    priority: t.risk,
    disposition,
    assignee,
    notes: [],
    audit,
    sar: null,
    createdAt: openedAt,
    updatedAt: audit[audit.length - 1]!.at,
  };
}

let store: Map<string, Case> | null = null;

function db(): Map<string, Case> {
  if (store) return store;
  const rng = new SeededRng(0x5eed);
  const map = new Map<string, Case>();
  for (const t of getMockTransactions()) {
    if (warrantsCase(t)) map.set(`case_${t.id.replace("txn_", "")}`, buildCase(t, rng));
  }
  store = map;
  return map;
}

function transactionFor(c: Case): Transaction {
  const t = getMockTransactions().find((x) => x.id === c.transactionId);
  if (!t) throw new Error(`Transaction ${c.transactionId} missing for case ${c.id}`);
  return t;
}

/** Snapshot a case (copying mutable arrays) joined with its transaction. */
function join(c: Case): CaseRecord {
  return {
    ...c,
    notes: [...c.notes],
    audit: [...c.audit],
    transaction: transactionFor(c),
  };
}

function touch(c: Case) {
  c.updatedAt = new Date().toISOString();
}

// ── Reads ────────────────────────────────────────────────────────────────

export function listCases(query: CasesQuery = {}): PaginatedCases {
  const { search = "", status = "all", priority = "all" } = query;
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, Math.min(50, query.pageSize ?? 10));
  const term = search.toLowerCase().trim();

  const all = [...db().values()].map(join);

  const counts: Record<CaseStatus, number> = {
    open: 0,
    investigating: 0,
    escalated: 0,
    closed: 0,
  };
  for (const c of all) counts[c.status]++;

  const filtered = all
    .filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (priority !== "all" && c.priority !== priority) return false;
      if (term) {
        const hay =
          `${c.reference} ${c.title} ${c.transaction.customer.name} ${c.assignee ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    })
    // Highest priority first, then most recently updated.
    .sort((a, b) => {
      const order: Record<RiskLevel, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      if (order[a.priority] !== order[b.priority]) return order[a.priority] - order[b.priority];
      return +new Date(b.updatedAt) - +new Date(a.updatedAt);
    });

  const start = (page - 1) * pageSize;
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
    counts,
  };
}

export function getCase(id: string): CaseRecord | null {
  const c = db().get(id);
  return c ? join(c) : null;
}

/** All cases opened against a given customer's transactions. */
export function getCasesByCustomer(customerId: string): CaseRecord[] {
  return [...db().values()]
    .map(join)
    .filter((c) => c.transaction.customer.id === customerId);
}

// ── Mutations ──────────────────────────────────────────────────────────────

export function assignCase(id: string, assignee: string | null, actor: string) {
  const c = db().get(id);
  if (!c) return null;
  c.assignee = assignee;
  c.audit.push(
    auditEvent(
      actor,
      assignee ? "Case assigned" : "Case unassigned",
      assignee ? `Assigned to ${assignee}.` : undefined,
    ),
  );
  touch(c);
  return join(c);
}

export function setCaseStatus(id: string, status: CaseStatus, actor: string) {
  const c = db().get(id);
  if (!c) return null;
  const prev = c.status;
  c.status = status;
  if (status === "closed" && c.disposition === "unreviewed") {
    c.disposition = "cleared";
  }
  c.audit.push(
    auditEvent(actor, `Status changed to ${status}`, `Was ${prev}.`),
  );
  touch(c);
  return join(c);
}

export function addCaseNote(id: string, body: string, author: string) {
  const c = db().get(id);
  if (!c) return null;
  c.notes.push({
    id: `note_${Date.now()}_${c.notes.length}`,
    author,
    body,
    at: new Date().toISOString(),
  });
  c.audit.push(auditEvent(author, "Note added", body.slice(0, 80)));
  touch(c);
  return join(c);
}

export function escalateCase(id: string, actor: string) {
  const c = db().get(id);
  if (!c) return null;
  c.status = "escalated";
  c.disposition = "sar_filed";
  c.audit.push(
    auditEvent(actor, "Escalated to SAR", "Flagged for Suspicious Activity Report filing."),
  );
  touch(c);
  return join(c);
}

export function saveSar(
  id: string,
  narrative: string,
  draftedBy: SarReport["draftedBy"],
  status: SarReport["status"],
  actor: string,
) {
  const c = db().get(id);
  if (!c) return null;
  c.sar = {
    id: c.sar?.id ?? `sar_${Date.now()}`,
    narrative,
    draftedBy,
    status,
    createdAt: c.sar?.createdAt ?? new Date().toISOString(),
  };
  c.audit.push(
    auditEvent(
      actor,
      status === "approved" ? "SAR approved" : "SAR draft saved",
      draftedBy === "ai" ? "Drafted with AI assistance." : undefined,
    ),
  );
  touch(c);
  return join(c);
}
