import { api } from "./client";
import type { DetectionRuleWithMatches } from "@/lib/types";

export interface RulesResponse {
  data: DetectionRuleWithMatches[];
  coverage: number;
  totalTransactions: number;
}

export function fetchRules() {
  return api.get<RulesResponse>("/api/rules");
}

export function updateRule(
  id: string,
  patch: { enabled?: boolean; threshold?: number },
) {
  return api.patch<DetectionRuleWithMatches>(`/api/rules/${id}`, patch);
}
