import { NextResponse } from "next/server";
import { addCaseNote } from "@/lib/mock/cases";
import { sleep } from "@/lib/utils";

const DEFAULT_ACTOR = "Ayodele Analyst";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(300);
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    body?: string;
    author?: string;
  };
  const text = body.body?.trim();
  if (!text) {
    return NextResponse.json({ error: "Note body is required" }, { status: 400 });
  }
  const record = addCaseNote(id, text, body.author ?? DEFAULT_ACTOR);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}
