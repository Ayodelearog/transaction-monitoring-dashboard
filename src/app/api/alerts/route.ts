import { NextResponse } from "next/server";
import { listCases } from "@/lib/mock/cases";
import { sleep } from "@/lib/utils";
import type { CaseStatus, RiskLevel } from "@/lib/types";

export async function GET(request: Request) {
  await sleep(400);
  const url = new URL(request.url);
  const result = listCases({
    search: url.searchParams.get("search") ?? "",
    status: (url.searchParams.get("status") as CaseStatus | "all" | null) ?? "all",
    priority: (url.searchParams.get("priority") as RiskLevel | "all" | null) ?? "all",
    page: Number(url.searchParams.get("page") ?? "1"),
    pageSize: Number(url.searchParams.get("pageSize") ?? "10"),
  });
  return NextResponse.json(result);
}
