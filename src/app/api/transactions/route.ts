import { NextResponse } from "next/server";
import { getMockTransactions } from "@/lib/mock/data";
import { sleep } from "@/lib/utils";
import type { RiskLevel, TransactionStatus } from "@/lib/types";

export async function GET(request: Request) {
  await sleep(400);
  const url = new URL(request.url);
  const search = url.searchParams.get("search")?.toLowerCase().trim() ?? "";
  const status = url.searchParams.get("status") as TransactionStatus | "all" | null;
  const risk = url.searchParams.get("risk") as RiskLevel | "all" | null;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
  const pageSize = Math.max(1, Math.min(50, Number(url.searchParams.get("pageSize") ?? "10")));

  const all = getMockTransactions();
  const filtered = all.filter((t) => {
    if (status && status !== "all" && t.status !== status) return false;
    if (risk && risk !== "all" && t.risk !== risk) return false;
    if (search) {
      const haystack = `${t.customer.name} ${t.reference} ${t.counterparty}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return NextResponse.json({
    data,
    total: filtered.length,
    page,
    pageSize,
  });
}
