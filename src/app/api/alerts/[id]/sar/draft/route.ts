import { streamText } from "ai";
import { NextResponse } from "next/server";
import { getCase } from "@/lib/mock/cases";
import {
  buildCaseContext,
  hasAiCredentials,
  SAR_SYSTEM,
  TRIAGE_MODEL,
} from "@/lib/ai/triage";

export const maxDuration = 60;

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const record = getCase(id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  if (!hasAiCredentials()) {
    return NextResponse.json(
      { error: "AI is not configured. Set AI_GATEWAY_API_KEY to enable SAR drafting." },
      { status: 503 },
    );
  }

  const result = streamText({
    model: TRIAGE_MODEL,
    system: SAR_SYSTEM,
    prompt: `Draft the SAR narrative for this case:\n\n${buildCaseContext(record)}`,
  });

  return result.toTextStreamResponse();
}
