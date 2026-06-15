"use client";

import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarDays,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCustomer, useUpdateKyc } from "@/hooks/use-customers";
import { formatCurrency } from "@/lib/utils";
import {
  caseStatusLabel,
  caseStatusTone,
  kycLabel,
  kycTone,
  riskLabel,
  riskTone,
  statusLabel,
  statusTone,
} from "@/lib/ui-mappings";
import type { CustomerDetail, CustomerRecord, KycStatus } from "@/lib/types";

interface CustomerDrawerProps {
  customerId: string | null;
  fallback?: CustomerRecord | null;
  onClose: () => void;
}

export function CustomerDrawer({ customerId, fallback, onClose }: CustomerDrawerProps) {
  const { data: fetched, isLoading } = useCustomer(customerId);
  const detail = fetched ?? null;

  return (
    <Drawer
      open={Boolean(customerId)}
      onClose={onClose}
      widthClassName="w-full sm:w-[580px]"
      title={detail?.name ?? fallback?.name ?? "Customer"}
      description={
        detail || fallback
          ? `${(detail ?? fallback)!.id} · ${(detail ?? fallback)!.country}`
          : "Loading customer…"
      }
    >
      {!detail || isLoading ? <DrawerSkeleton /> : <CustomerBody detail={detail} />}
    </Drawer>
  );
}

const KYC_ACTIONS: Array<{ status: KycStatus; label: string; variant: "primary" | "secondary" | "danger" }> = [
  { status: "verified", label: "Verify", variant: "primary" },
  { status: "pending", label: "Mark pending", variant: "secondary" },
  { status: "rejected", label: "Reject", variant: "danger" },
];

function CustomerBody({ detail }: { detail: CustomerDetail }) {
  const updateKyc = useUpdateKyc(detail.id);

  return (
    <div className="space-y-6">
      {/* Profile */}
      <section className="rounded-2xl border border-border bg-muted/30 p-5">
        <div className="flex items-center gap-3">
          <Avatar name={detail.name} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{detail.name}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <Badge tone={kycTone[detail.kycStatus]}>{kycLabel[detail.kycStatus]}</Badge>
              <Badge tone={riskTone[detail.riskLevel]} dot>
                {riskLabel[detail.riskLevel]} · {detail.riskScore}
              </Badge>
            </div>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <DetailRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={detail.email} />
          <DetailRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={detail.phone} />
          <DetailRow
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Customer since"
            value={format(new Date(detail.joinedAt), "MMM d, yyyy")}
          />
          <DetailRow
            icon={<ShieldCheck className="h-3.5 w-3.5" />}
            label="Open cases"
            value={String(detail.openCases)}
          />
        </dl>
      </section>

      {/* KYC workflow */}
      <Section title="KYC review">
        <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
          <p className="text-xs text-muted-foreground">
            Current status:{" "}
            <span className="font-semibold text-foreground">
              {kycLabel[detail.kycStatus]}
            </span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {KYC_ACTIONS.map((action) => (
              <Button
                key={action.status}
                size="sm"
                variant={action.variant}
                disabled={detail.kycStatus === action.status || updateKyc.isPending}
                loading={updateKyc.isPending && updateKyc.variables === action.status}
                onClick={() => updateKyc.mutate(action.status)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </Section>

      {/* Aggregates */}
      <Section title="Activity summary">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Transactions" value={String(detail.transactionCount)} />
          <Stat label="Total volume" value={formatCurrency(detail.totalVolume, "USD")} />
          <Stat label="Flagged" value={String(detail.flaggedCount)} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Last activity {formatDistanceToNow(new Date(detail.lastActivityAt), { addSuffix: true })}
        </p>
      </Section>

      {/* Linked cases */}
      {detail.cases.length > 0 && (
        <Section title="Linked cases">
          <ul className="space-y-2">
            {detail.cases.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/dashboard/alerts?open=${c.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-3.5 py-2.5 transition-colors hover:bg-muted/60"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground">{c.reference}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge tone={caseStatusTone[c.status]}>{caseStatusLabel[c.status]}</Badge>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Recent transactions */}
      <Section title="Recent transactions">
        <ul className="space-y-2">
          {detail.transactions.slice(0, 8).map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{t.reference}</p>
                <p className="text-muted-foreground">
                  {format(new Date(t.createdAt), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(t.amount, t.currency)}
                </p>
                <Badge tone={statusTone[t.status]} className="mt-1">
                  {statusLabel[t.status]}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* KYC audit */}
      <Section title="KYC audit trail">
        <ol className="relative ml-2 border-l border-border space-y-4 pl-5">
          {detail.kycAudit.map((e, index) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.03 }}
              className="relative"
            >
              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <p className="text-xs font-medium text-foreground">{e.action}</p>
              <p className="text-[11px] text-muted-foreground">
                {e.actor} · {format(new Date(e.at), "MMM d, yyyy · h:mm a")}
              </p>
              {e.detail && <p className="mt-1 text-xs text-muted-foreground">{e.detail}</p>}
            </motion.li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-base font-semibold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <dt className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-foreground truncate">{value}</dd>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  );
}
