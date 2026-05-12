"use client";

import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Hash, Mail, Phone, Receipt, ShieldAlert } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { useTransaction } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import { riskLabel, riskTone, statusLabel, statusTone } from "@/lib/ui-mappings";
import type { RiskLevel, Transaction } from "@/lib/types";

interface TransactionDrawerProps {
  transactionId: string | null;
  fallback?: Transaction | null;
  onClose: () => void;
}

const riskMeterColor: Record<RiskLevel, string> = {
  low: "hsl(var(--success))",
  medium: "hsl(var(--warning))",
  high: "hsl(var(--danger))",
  critical: "hsl(var(--danger))",
};

export function TransactionDrawer({
  transactionId,
  fallback,
  onClose,
}: TransactionDrawerProps) {
  const { data: fetched, isLoading } = useTransaction(transactionId);
  const transaction = fetched ?? fallback ?? null;

  return (
    <Drawer
      open={Boolean(transactionId)}
      onClose={onClose}
      title={transaction ? transaction.reference : "Transaction details"}
      description={
        transaction
          ? `Initiated ${formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}`
          : "Loading transaction…"
      }
    >
      {!transaction || isLoading ? <DrawerSkeleton /> : <DrawerBody transaction={transaction} />}
    </Drawer>
  );
}

function DrawerBody({ transaction }: { transaction: Transaction }) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-muted/30 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Transaction amount
            </p>
            <p className="text-2xl font-semibold text-foreground tabular-nums mt-1">
              {formatCurrency(transaction.amount, transaction.currency)}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              <Badge tone={statusTone[transaction.status]}>
                {statusLabel[transaction.status]}
              </Badge>
              <Badge tone={riskTone[transaction.risk]} dot>
                {riskLabel[transaction.risk]} risk
              </Badge>
              <Badge tone="neutral" className="capitalize">
                {transaction.type}
              </Badge>
            </div>
          </div>
          <RiskMeter score={transaction.riskScore} level={transaction.risk} />
        </div>
      </section>

      <Section title="Customer">
        <div className="flex items-center gap-3">
          <Avatar name={transaction.customer.name} size="lg" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{transaction.customer.name}</p>
            <p className="text-xs text-muted-foreground">
              KYC{" "}
              <span className="capitalize font-medium text-foreground">
                {transaction.customer.kycStatus}
              </span>{" "}
              · {transaction.customer.country}
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <DetailRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={transaction.customer.email} />
          <DetailRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={transaction.customer.phone} />
          <DetailRow
            icon={<Hash className="h-3.5 w-3.5" />}
            label="Customer ID"
            value={transaction.customer.id}
          />
          <DetailRow
            icon={<Receipt className="h-3.5 w-3.5" />}
            label="Counterparty"
            value={transaction.counterparty}
          />
        </dl>
      </Section>

      <Section title="Risk indicators" icon={<ShieldAlert className="h-3.5 w-3.5" />}>
        <ul className="space-y-2">
          {transaction.indicators.map((indicator) => (
            <li
              key={indicator.label}
              className="rounded-xl border border-border bg-surface px-3.5 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-foreground">
                  {indicator.label}
                </p>
                <Badge tone={riskTone[indicator.severity]} dot>
                  {riskLabel[indicator.severity]}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {indicator.description}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Transaction history">
        <ul className="space-y-2">
          {transaction.history.map((h) => (
            <li
              key={h.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-xs"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{h.reference}</p>
                <p className="text-muted-foreground">
                  {format(new Date(h.createdAt), "MMM d, yyyy · h:mm a")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground tabular-nums">
                  {formatCurrency(h.amount, transaction.currency)}
                </p>
                <Badge tone={statusTone[h.status]} className="mt-1">
                  {statusLabel[h.status]}
                </Badge>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Activity timeline">
        <ol className="relative ml-2 border-l border-border space-y-4 pl-5">
          {transaction.activity.map((event, index) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              className="relative"
            >
              <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
              <p className="text-xs font-medium text-foreground">{event.action}</p>
              <p className="text-[11px] text-muted-foreground">
                {event.actor} ·{" "}
                {format(new Date(event.at), "MMM d, yyyy · h:mm a")}
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

function RiskMeter({ score, level }: { score: number; level: RiskLevel }) {
  const size = 76;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = riskMeterColor[level];
  return (
    <div className="relative inline-flex" aria-label={`Risk score ${score}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Score
        </span>
        <span className="text-base font-semibold text-foreground tabular-nums">
          {score}
        </span>
      </div>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-32 w-full rounded-2xl" />
    </div>
  );
}
