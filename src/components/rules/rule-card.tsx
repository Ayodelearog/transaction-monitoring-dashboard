"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn, formatNumber } from "@/lib/utils";
import { riskLabel, riskTone, ruleCategoryLabel } from "@/lib/ui-mappings";
import type { DetectionRuleWithMatches } from "@/lib/types";

interface RuleCardProps {
  rule: DetectionRuleWithMatches;
  pending: boolean;
  index: number;
  onToggle: (enabled: boolean) => void;
  onThreshold: (value: number) => void;
}

export function RuleCard({ rule, pending, index, onToggle, onThreshold }: RuleCardProps) {
  const [draft, setDraft] = useState(String(rule.threshold ?? ""));

  const commitThreshold = () => {
    const value = Number(draft);
    if (Number.isFinite(value) && value !== rule.threshold) {
      onThreshold(value);
    } else {
      setDraft(String(rule.threshold ?? ""));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 transition-opacity",
        !rule.enabled && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{rule.name}</p>
            <Badge tone="neutral">{ruleCategoryLabel[rule.category]}</Badge>
            <Badge tone={riskTone[rule.severity]} dot>
              {riskLabel[rule.severity]}
            </Badge>
          </div>
          <p className="mt-1.5 text-sm text-muted-foreground">{rule.description}</p>
        </div>
        <Switch
          checked={rule.enabled}
          onChange={onToggle}
          disabled={pending}
          aria-label={`Toggle ${rule.name}`}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        {rule.threshold !== undefined ? (
          <label className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {rule.thresholdLabel ?? "Threshold"}
            </span>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={draft}
                disabled={pending || !rule.enabled}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitThreshold}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="w-32"
                aria-label={`${rule.name} threshold`}
              />
              {rule.thresholdUnit && (
                <span className="text-xs text-muted-foreground">{rule.thresholdUnit}</span>
              )}
            </div>
          </label>
        ) : (
          <span className="text-[11px] text-muted-foreground">No tunable threshold</span>
        )}

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Current matches
          </p>
          <p className="text-lg font-semibold text-foreground tabular-nums">
            {formatNumber(rule.matchCount)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
