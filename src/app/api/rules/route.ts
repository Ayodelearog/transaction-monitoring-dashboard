import { NextResponse } from "next/server";
import { listRules, rulesCoverage } from "@/lib/mock/rules";
import { getMockTransactions } from "@/lib/mock/data";
import { sleep } from "@/lib/utils";

export async function GET() {
  await sleep(350);
  return NextResponse.json({
    data: listRules(),
    coverage: rulesCoverage(),
    totalTransactions: getMockTransactions().length,
  });
}
