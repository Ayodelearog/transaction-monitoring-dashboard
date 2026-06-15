"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  LayoutDashboard,
  Radar,
  ShieldAlert,
  Sparkles,
  Users,
  Activity,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useAuthStore } from "@/lib/store/auth";

const REPO_URL = "https://github.com/Ayodelearog/transaction-monitoring-dashboard";

const features = [
  {
    icon: Activity,
    title: "Real-time monitoring",
    body: "Live KPIs, weekly volume, and risk distribution that refresh on a polling cadence — a searchable, filterable transactions table with a full detail drawer.",
  },
  {
    icon: ShieldAlert,
    title: "Alerts & case management",
    body: "A triage queue derived from flagged activity, with status workflow, assignment, investigator notes, an audit trail, and SAR escalation.",
  },
  {
    icon: Sparkles,
    title: "AI-assisted triage",
    body: "Claude drafts the risk assessment and the Suspicious Activity Report narrative, streamed token-by-token — the analyst keeps the final call.",
  },
  {
    icon: Users,
    title: "Customers & KYC",
    body: "Customer profiles with risk exposure, a KYC review workflow with its own audit trail, and cases that link back to the alert queue.",
  },
  {
    icon: Radar,
    title: "Detection-rules engine",
    body: "A tunable catalog of rules — toggle them, adjust thresholds — that explains exactly why each transaction was flagged.",
  },
  {
    icon: LayoutDashboard,
    title: "Built to feel real",
    body: "Next.js 16, React 19, TanStack Query, Zustand, Tailwind v4. Deterministic mock data, dark mode, command-palette search, and tested.",
  },
];

export default function LandingPage() {
  const { hydrated, user } = useAuthStore();
  const ctaHref = hydrated && user ? "/dashboard" : "/login";
  const ctaLabel = hydrated && user ? "Open dashboard" : "View live demo";

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
          <Image
            src="/smartcomply-blue.svg"
            alt="Smartcomply"
            width={176}
            height={30}
            priority
            className="h-5 w-auto dark:brightness-0 dark:invert"
          />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href={ctaHref}
              className="hidden sm:inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {hydrated && user ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pb-16 pt-16 sm:pt-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mx-auto flex max-w-3xl flex-col items-center"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              AML · Fraud &amp; transaction monitoring
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Monitor, investigate, and resolve risky transactions —{" "}
              <span className="text-primary">with an AI analyst in the loop.</span>
            </h1>
            <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
              A compliance workspace for analysts: real-time monitoring, an alert &amp;
              case-management workflow, KYC review, a configurable detection-rules engine,
              and Claude-powered triage that drafts risk assessments and regulatory reports.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={ctaHref}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-surface px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <Code2 className="h-4 w-4" />
                Browse the code
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Demo login is pre-filled —{" "}
              <span className="font-medium text-foreground">analyst@smartcomply.com</span>
            </p>
          </motion.div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface/40">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-14 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.3, delay: (i % 3) * 0.05 }}
                  className="rounded-2xl border border-border bg-surface p-6"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            Built by Ayodele Arogundade · a portfolio build on a mocked AML domain.
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Code2 className="h-3.5 w-3.5" />
            View source
          </a>
        </div>
      </footer>
    </div>
  );
}
