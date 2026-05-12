import { api } from "./client";
import type { LoginResponse } from "@/lib/types";

export function login(input: { email: string; password: string }) {
  return api.post<LoginResponse>("/api/auth/login", input);
}
