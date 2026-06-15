import { streamText } from "ai";
import { NextResponse } from "next/server";
import { getCase } from "@/lib/mock/cases";
import {
  buildCaseContext,
  hasAiCredentials,
  TRIAGE_MODEL,
  TRIAGE_SYSTEM,
} from "@/lib/ai/triage";

// Streaming generations can run longer than a default function tick.
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
      { error: "AI is not configured. Set AI_GATEWAY_API_KEY to enable triage." },
      { status: 503 },
    );
  }

  const result = streamText({
    model: TRIAGE_MODEL,
    system: TRIAGE_SYSTEM,
    prompt: `Assess the following case:\n\n${buildCaseContext(record)}`,
  });

  return result.toTextStreamResponse();
}
