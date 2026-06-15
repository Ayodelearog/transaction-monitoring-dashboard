"use client";

import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Radar,
  Receipt,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AiAnalysisPanel, SarPanel } from "@/components/alerts/ai-panels";
import {
  useAddNote,
  useAlert,
  useEscalateAlert,
  useUpdateAlert,
} from "@/hooks/use-alerts";
import { formatCurrency } from "@/lib/utils";
import {
  caseStatusLabel,
  caseStatusTone,
  dispositionLabel,
  dispositionTone,
  riskLabel,
  riskTone,
  ruleCategoryLabel,
} from "@/lib/ui-mappings";
import type { CaseRecord, CaseStatus } from "@/lib/types";

const ASSIGNEES = ["Ayodele Analyst", "Chinwe Okafor", "Tunde Bello"];

const statusOptions = [
  { value: "open", label: "Open" },
  { value: "investigating", label: "Investigating" },
  { value: "escalated", label: "Escalated" },
  { value: "closed", label: "Closed" },
];

const assigneeOptions = [
  { value: "", label: "Unassigned" },
  ...ASSIGNEES.map((a) => ({ value: a, label: a })),
];

interface CaseDrawerProps {
  caseId: string | null;
  fallback?: CaseRecord | null;
  onClose: () => void;
}

export function CaseDrawer({ caseId, fallback, onClose }: CaseDrawerProps) {
  const { data: fetched, isLoading } = useAlert(caseId);
  const record = fetched ?? fallback ?? null;

  return (
    <Drawer
      open={Boolean(caseId)}
      onClose={onClose}
      widthClassName="w-full sm:w-[600px]"
      title={record ? record.reference : "Case details"}
      description={
        record
          ? `Opened ${formatDistanceToNow(new Date(record.createdAt), { addSuffix: true })}`
          : "Loading case…"
      }
    >
      {!record || (isLoading && !fetched) ? (
        <DrawerSkeleton />
      ) : (
        <CaseBody record={record} />
      )}
    </Drawer>
  );
}

function CaseBody({ record }: { record: CaseRecord }) {
  const update = useUpdateAlert(record.id);
  const escalate = useEscalateAlert(record.id);
  const t = record.transaction;

  return (
    <div className="space-y-6">
      {/* Overview + workflow */}
      <section className="rounded-2xl border border-border bg-muted/30 p-5">
        <p className="text-sm font-semibold text-foreground">{record.title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{record.summary}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={caseStatusTone[record.status]}>
            {caseStatusLabel[record.status]}
          </Badge>
          <Badge tone={riskTone[record.priority]} dot>
            {riskLabel[record.priority]} priority
          </Badge>
          <Badge tone={dispositionTone[record.disposition]}>
            {dispositionLabel[record.disposition]}
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <Select
              aria-label="Case status"
              options={statusOptions}
              value={record.status}
              disabled={update.isPending}
              onChange={(e) =>
                update.mutate({ status: e.target.value as CaseStatus })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Assignee
            </span>
            <Select
              aria-label="Case assignee"
              options={assigneeOptions}
              value={record.assignee ?? ""}
              disabled={update.isPending}
              onChange={(e) =>
                update.mutate({ assignee: e.target.value || null })
              }
            />
          </label>
        </div>

        {record.status !== "escalated" && (
          <Button
            variant="danger"
            size="sm"
            className="mt-3 w-full sm:w-auto"
            loading={escalate.isPending}
            onClick={() => escalate.mutate()}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Escalate to SAR
          </Button>
        )}
      </section>

      <AiAnalysisPanel caseId={record.id} />

      {/* Triggered detection rules — why this case exists */}
      {record.triggeredRules.length > 0 && (
        <Section title="Triggered rules" icon={<Radar className="h-3.5 w-3.5" />}>
          <ul className="space-y-2">
            {record.triggeredRules.map((rule) => (
              <li
                key={rule.ruleId}
                className="rounded-xl border border-border bg-surface px-3.5 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{rule.name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge tone="neutral">{ruleCategoryLabel[rule.category]}</Badge>
                    <Badge tone={riskTone[rule.severity]} dot>
                      {riskLabel[rule.severity]}
                    </Badge>
                  </div>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{rule.rationale}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Linked transaction */}
      <Section title="Linked transaction" icon={<Receipt className="h-3.5 w-3.5" />}>
        <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={t.customer.name} size="md" />
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{t.customer.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.reference} · KYC{" "}
                  <span className="capitalize">{t.customer.kycStatus}</span> · {t.customer.country}
                </p>
              </div>
            </div>
            <p className="text-base font-semibold text-foreground tabular-nums shrink-0">
              {formatCurrency(t.amount, t.currency)}
            </p>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <Detail label="Type" value={t.type} capitalize />
            <Detail label="Channel" value={t.channel} capitalize />
            <Detail label="Counterparty" value={t.counterparty} />
            <Detail label="Risk score" value={`${t.riskScore}/100`} />
          </dl>
        </div>
      </Section>

      {/* Risk indicators */}
      <Section title="Risk indicators" icon={<ShieldAlert className="h-3.5 w-3.5" />}>
        <ul className="space-y-2">
          {t.indicators.map((indicator) => (
            <li
              key={indicator.label}
              className="rounded-xl border border-border bg-surface px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">{indicator.label}</p>
                <Badge tone={riskTone[indicator.severity]} dot>
                  {riskLabel[indicator.severity]}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{indicator.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* SAR drafting — surfaced once a case is escalated */}
      {(record.status === "escalated" || record.sar) && (
        <Section title="Regulatory filing">
          <SarPanel caseId={record.id} existing={record.sar} />
        </Section>
      )}

      {/* Notes */}
      <Section title="Investigator notes">
        <NotesBlock record={record} />
      </Section>

      {/* Audit timeline */}
      <Section title="Audit trail" icon={<UserCheck className="h-3.5 w-3.5" />}>
        <ol className="relative ml-2 border-l border-border space-y-4 pl-5">
          {record.audit.map((event, index) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="relative"
            >
              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <p className="text-xs font-medium text-foreground">{event.action}</p>
              <p className="text-[11px] text-muted-foreground">
                {event.actor} · {format(new Date(event.at), "MMM d, yyyy · h:mm a")}
              </p>
              {event.detail && (
                <p className="mt-1 text-xs text-muted-foreground">{event.detail}</p>
              )}
            </motion.li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function NotesBlock({ record }: { record: CaseRecord }) {
  const addNote = useAddNote(record.id);
  const [body, setBody] = useState("");

  const submit = () => {
    const text = body.trim();
    if (!text) return;
    addNote.mutate(text, { onSuccess: () => setBody("") });
  };

  return (
    <div className="space-y-3">
      {record.notes.length > 0 && (
        <ul className="space-y-2">
          {record.notes.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border border-border bg-surface px-3.5 py-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground">{note.author}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatDistanceToNow(new Date(note.at), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/90">{note.body}</p>
            </li>
          ))}
        </ul>
      )}
      <div className="space-y-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add an investigation note…"
          aria-label="Add note"
        />
        <Button
          size="sm"
          variant="secondary"
          onClick={submit}
          loading={addNote.isPending}
          disabled={!body.trim()}
        >
          Add note
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </h3>
      {children}
    </section>
  );
}

function Detail({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`font-medium text-foreground truncate ${capitalize ? "capitalize" : ""}`}>
        {value}
      </dd>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
