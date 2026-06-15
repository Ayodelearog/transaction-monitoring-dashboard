import { format } from "date-fns";
import type { CaseRecord } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

/** Default model, served through the Vercel AI Gateway (`provider/model`). */
export const TRIAGE_MODEL = "anthropic/claude-sonnet-4.6";

/**
 * The AI features need a gateway/Anthropic key. On Vercel deployments OIDC is
 * used automatically; locally an explicit key is required.
 */
export function hasAiCredentials(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
}

/** Compact, structured snapshot of a case for the model to reason over. */
export function buildCaseContext(record: CaseRecord): string {
  const t = record.transaction;
  const c = t.customer;
  const indicators = t.indicators
    .map((i) => `- [${i.severity.toUpperCase()}] ${i.label}: ${i.description}`)
    .join("\n");
  const history = t.history
    .map(
      (h) =>
        `- ${format(new Date(h.createdAt), "yyyy-MM-dd")} · ${h.reference} · ${formatCurrency(h.amount, t.currency)} · ${h.status}`,
    )
    .join("\n");
  const notes = record.notes.length
    ? record.notes.map((n) => `- ${n.author}: ${n.body}`).join("\n")
    : "- (none)";
  const firedRules = record.triggeredRules.length
    ? record.triggeredRules
        .map((r) => `- [${r.severity.toUpperCase()}] ${r.name}: ${r.rationale}`)
        .join("\n")
    : "- (none)";

  return [
    `CASE ${record.id} — ${record.title}`,
    `Status: ${record.status} | Priority: ${record.priority} | Disposition: ${record.disposition}`,
    "",
    "TRANSACTION",
    `Reference: ${t.reference}`,
    `Amount: ${formatCurrency(t.amount, t.currency)}`,
    `Type: ${t.type} | Channel: ${t.channel} | Status: ${t.status}`,
    `Counterparty: ${t.counterparty}`,
    `Risk score: ${t.riskScore}/100 (${t.risk})`,
    `Initiated: ${format(new Date(t.createdAt), "yyyy-MM-dd HH:mm 'UTC'")}`,
    "",
    "CUSTOMER",
    `Name: ${c.name} | Country: ${c.country} | KYC: ${c.kycStatus}`,
    `Customer risk score: ${c.riskScore}/100`,
    `Customer since: ${format(new Date(c.joinedAt), "yyyy-MM-dd")}`,
    "",
    "RISK INDICATORS",
    indicators || "- (none)",
    "",
    "DETECTION RULES TRIGGERED",
    firedRules,
    "",
    "RECENT TRANSACTION HISTORY",
    history || "- (none)",
    "",
    "ANALYST NOTES",
    notes,
  ].join("\n");
}

export const TRIAGE_SYSTEM = `You are an AML (anti-money-laundering) triage assistant for compliance analysts at a financial institution. Given a flagged transaction case, produce a concise, professional risk assessment.

Structure your response in markdown with these sections:
## Summary
One or two sentences on what was flagged and why it matters.
## Key risk factors
A short bulleted list of the most material risk signals, each with a brief rationale.
## Recommended disposition
State one of: ESCALATE TO SAR, CONTINUE INVESTIGATION, or CLEAR AS FALSE POSITIVE — followed by a one-line justification.

Be specific to the data provided. Do not invent facts. Keep the whole response under 220 words. You are assisting a human analyst who makes the final decision.`;

export const SAR_SYSTEM = `You are a compliance officer drafting the narrative section of a Suspicious Activity Report (SAR). Write a formal, factual narrative suitable for regulatory filing.

Cover, in flowing prose (not bullet points): who the subject is, what the suspicious activity was, the amounts and dates involved, the specific red flags observed, and why the activity is being reported. Use past tense and a neutral, objective tone. Refer to the customer as "the subject" and cite the transaction reference. Do not include a heading, signature, or any commentary outside the narrative itself. Keep it to 150-250 words. Only use facts present in the case data.`;
