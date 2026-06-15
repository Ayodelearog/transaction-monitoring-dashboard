import { NextResponse } from "next/server";
import { updateRule } from "@/lib/mock/rules";
import { sleep } from "@/lib/utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(250);
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    enabled?: boolean;
    threshold?: number;
  };

  if (
    body.threshold !== undefined &&
    (typeof body.threshold !== "number" || Number.isNaN(body.threshold))
  ) {
    return NextResponse.json({ error: "Invalid threshold" }, { status: 400 });
  }

  const rule = updateRule(id, body);
  if (!rule) {
    return NextResponse.json({ error: "Rule not found" }, { status: 404 });
  }
  return NextResponse.json(rule);
}
