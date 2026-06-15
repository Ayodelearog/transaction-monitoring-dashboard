import type {
  CaseDisposition,
  CaseStatus,
  KycStatus,
  RiskLevel,
  TransactionStatus,
} from "@/lib/types";

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

export const caseStatusTone: Record<CaseStatus, Tone> = {
  open: "info",
  investigating: "warning",
  escalated: "danger",
  closed: "neutral",
};

export const caseStatusLabel: Record<CaseStatus, string> = {
  open: "Open",
  investigating: "Investigating",
  escalated: "Escalated",
  closed: "Closed",
};

export const dispositionTone: Record<CaseDisposition, Tone> = {
  unreviewed: "neutral",
  cleared: "success",
  false_positive: "info",
  sar_filed: "danger",
};

export const dispositionLabel: Record<CaseDisposition, string> = {
  unreviewed: "Unreviewed",
  cleared: "Cleared",
  false_positive: "False positive",
  sar_filed: "SAR filed",
};

export const kycTone: Record<KycStatus, Tone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
};

export const kycLabel: Record<KycStatus, string> = {
  verified: "Verified",
  pending: "Pending",
  rejected: "Rejected",
};
