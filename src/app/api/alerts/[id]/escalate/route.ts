import { NextResponse } from "next/server";
import { escalateCase } from "@/lib/mock/cases";
import { sleep } from "@/lib/utils";

const DEFAULT_ACTOR = "Ayodele Analyst";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(350);
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { actor?: string };
  const record = escalateCase(id, body.actor ?? DEFAULT_ACTOR);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
