import { NextResponse } from "next/server";
import { getMockStats } from "@/lib/mock/data";
import { sleep } from "@/lib/utils";

export async function GET() {
  await sleep(450);
  const stats = getMockStats();

  const drift = Math.sin(Date.now() / 30_000);
  return NextResponse.json({
    ...stats,
    totalTransactions: stats.totalTransactions + Math.round(drift * 24),
    flaggedTransactions: stats.flaggedTransactions + Math.round(drift * 3),
  });
}
