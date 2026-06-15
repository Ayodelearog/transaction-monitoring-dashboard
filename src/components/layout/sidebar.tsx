"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  LayoutDashboard,
  Receipt,
  ShieldAlert,
  Users,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlerts } from "@/hooks/use-alerts";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { href: "/dashboard/alerts", label: "Alerts", icon: ShieldAlert },
  { href: "#", label: "Customers", icon: Users, disabled: true },
  { href: "#", label: "Settings", icon: Settings, disabled: true },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: alerts } = useAlerts({ pageSize: 1 });
  const activeCases = alerts
    ? alerts.counts.open + alerts.counts.investigating + alerts.counts.escalated
    : 0;

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[2px] lg:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed lg:sticky top-0 z-40 h-dvh w-64 shrink-0 border-r border-border bg-surface px-4 py-5 transition-transform duration-200",
          "lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Link
          href="/dashboard"
          className="flex flex-col items-start gap-5 px-2 mb-8"
          onClick={onClose}
        >
          <Image
            src="/smartcomply-blue.svg"
            alt="Smartcomply"
            width={176}
            height={30}
            priority
            className="h-5 w-auto dark:brightness-0 dark:invert"
          />
          <span className="block text-[10px] uppercase tracking-wider text-muted-foreground">
            Transaction Monitor
          </span>
        </Link>

        <nav className="space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspace
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const badge =
              item.href === "/dashboard/alerts" && activeCases > 0
                ? String(activeCases)
                : undefined;
            const isActive =
              !item.disabled &&
              (pathname === item.href ||
                (item.href !== "/dashboard" && pathname?.startsWith(item.href)));
            return (
              <Link
                key={item.label}
                href={item.disabled ? "#" : item.href}
                onClick={(e) => {
                  if (item.disabled) e.preventDefault();
                  else onClose();
                }}
                aria-disabled={item.disabled}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  item.disabled
                    ? "text-muted-foreground cursor-not-allowed opacity-60"
                    : isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-primary/10"
                    transition={{ type: "spring", stiffness: 360, damping: 30 }}
                  />
                )}
                <Icon className="relative h-4 w-4 shrink-0" />
                <span className="relative flex-1">{item.label}</span>
                {badge && (
                  <span className="relative rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-semibold text-danger">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="absolute inset-x-4 bottom-5 rounded-xl border border-border bg-muted/50 px-3 py-3 text-[11px] text-muted-foreground">
          <p className="font-semibold text-foreground mb-0.5">Demo workspace</p>
          <p>Mock data refreshes every 15 seconds via TanStack Query polling.</p>
        </div>
      </aside>
    </>
  );
}
