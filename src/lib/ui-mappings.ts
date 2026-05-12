import type { RiskLevel, TransactionStatus } from "@/lib/types";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export const statusTone: Record<TransactionStatus, Tone> = {
  completed: "success",
  pending: "warning",
  flagged: "danger",
  failed: "neutral",
  review: "info",
};

export const riskTone: Record<RiskLevel, Tone> = {
  low: "success",
  medium: "warning",
  high: "danger",
  critical: "danger",
};

export const riskLabel: Record<RiskLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const statusLabel: Record<TransactionStatus, string> = {
  completed: "Completed",
  pending: "Pending",
  flagged: "Flagged",
  failed: "Failed",
  review: "Under review",
};
