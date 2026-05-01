import { apiGet, apiPost } from "@/services/api-client";
import type { CurrentUser } from "@/types/domain";

export async function login(email: string, password: string): Promise<CurrentUser> {
  return apiPost<CurrentUser>("/api/auth/login", { email, password });
}

export async function logout(): Promise<void> {
  await apiPost<void>("/api/auth/logout");
}

export async function me(): Promise<CurrentUser> {
  return apiGet<CurrentUser>("/api/auth/me");
}
