import { NextResponse } from "next/server";
import { sleep } from "@/lib/utils";
import type { LoginResponse } from "@/lib/types";

const VALID_EMAIL = "analyst@smartcomply.com";
const VALID_PASSWORD = "Compliance123!";

export async function POST(request: Request) {
  await sleep(700);

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid credentials. Try the demo account shown on the form." },
      { status: 401 },
    );
  }

  const payload: LoginResponse = {
    token: `mock.${Date.now()}.${Math.random().toString(36).slice(2)}`,
    user: {
      id: "usr_001",
      name: "Ayodele Analyst",
      email: VALID_EMAIL,
      role: "analyst",
      avatarColor: "#6366f1",
    },
  };

  return NextResponse.json(payload);
}
