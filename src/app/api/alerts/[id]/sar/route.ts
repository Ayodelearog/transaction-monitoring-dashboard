import { NextResponse } from "next/server";
import { getCase, saveSar } from "@/lib/mock/cases";
import { sleep } from "@/lib/utils";
import type { SarReport } from "@/lib/types";

const DEFAULT_ACTOR = "Ayodele Analyst";

/** Persist (save or approve) a SAR narrative for a case. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(300);
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    narrative?: string;
    draftedBy?: SarReport["draftedBy"];
    status?: SarReport["status"];
    actor?: string;
  };

  const narrative = body.narrative?.trim();
  if (!narrative) {
    return NextResponse.json({ error: "SAR narrative is required" }, { status: 400 });
  }
  if (!getCase(id)) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  const record = saveSar(
    id,
    narrative,
    body.draftedBy ?? "analyst",
    body.status ?? "draft",
    body.actor ?? DEFAULT_ACTOR,
  );
  return NextResponse.json(record);
}
