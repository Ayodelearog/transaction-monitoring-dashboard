import { NextResponse } from "next/server";
import { getCustomer, setKycStatus } from "@/lib/mock/customers";
import { sleep } from "@/lib/utils";
import type { KycStatus } from "@/lib/types";

const DEFAULT_ACTOR = "Ayodele Analyst";
const VALID_KYC: KycStatus[] = ["verified", "pending", "rejected"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(250);
  const { id } = await params;
  const detail = getCustomer(id);
  if (!detail) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await sleep(300);
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as {
    kycStatus?: KycStatus;
    actor?: string;
  };

  if (!body.kycStatus || !VALID_KYC.includes(body.kycStatus)) {
    return NextResponse.json({ error: "Invalid KYC status" }, { status: 400 });
  }
  const detail = setKycStatus(id, body.kycStatus, body.actor ?? DEFAULT_ACTOR);
  if (!detail) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}
