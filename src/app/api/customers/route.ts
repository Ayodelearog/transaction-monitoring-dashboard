import { NextResponse } from "next/server";
import { listCustomers } from "@/lib/mock/customers";
import { sleep } from "@/lib/utils";
import type { KycStatus, RiskLevel } from "@/lib/types";

export async function GET(request: Request) {
  await sleep(400);
  const url = new URL(request.url);
  const result = listCustomers({
    search: url.searchParams.get("search") ?? "",
    kyc: (url.searchParams.get("kyc") as KycStatus | "all" | null) ?? "all",
    risk: (url.searchParams.get("risk") as RiskLevel | "all" | null) ?? "all",
    page: Number(url.searchParams.get("page") ?? "1"),
    pageSize: Number(url.searchParams.get("pageSize") ?? "10"),
  });
  return NextResponse.json(result);
}
