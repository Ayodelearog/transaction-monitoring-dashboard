import { NextResponse } from "next/server";
import { assignCase, getCase, setCaseStatus } from "@/lib/mock/cases";
import { sleep } from "@/lib/utils";
import type { CaseStatus } from "@/lib/types";

const DEFAULT_ACTOR = "Ayodele Analyst";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(250);
  const { id } = await params;
  const record = getCase(id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json(record);
}

const VALID_STATUSES: CaseStatus[] = ["open", "investigating", "escalated", "closed"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(300);
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    status?: CaseStatus;
    assignee?: string | null;
    actor?: string;
  };
  const actor = body.actor ?? DEFAULT_ACTOR;

  let record = getCase(id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    record = setCaseStatus(id, body.status, actor);
  }
  if (body.assignee !== undefined) {
    record = assignCase(id, body.assignee, actor);
  }

  return NextResponse.json(record);
}
