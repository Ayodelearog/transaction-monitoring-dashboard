import { NextResponse } from "next/server";
import { filterTransactions } from "@/lib/mock/data";
import { sleep } from "@/lib/utils";
import type { RiskLevel, TransactionStatus } from "@/lib/types";

export async function GET(request: Request) {
  await sleep(400);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") ?? "10")));

  const filtered = filterTransactions({
    search: url.searchParams.get("search") ?? "",
    status: (url.searchParams.get("status") as TransactionStatus | "all" | null) ?? "all",
    risk: (url.searchParams.get("risk") as RiskLevel | "all" | null) ?? "all",
  });

  const start = (page - 1) * pageSize;
  return NextResponse.json({
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  });
}
