import { NextResponse } from "next/server";
import { getMockTransactions } from "@/lib/mock/data";
import { sleep } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(250);
  const { id } = await params;
  const transaction = getMockTransactions().find((t) => t.id === id);
  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }
  return NextResponse.json(transaction);
}
