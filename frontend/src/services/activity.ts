import { apiGet } from "@/services/api-client";
import type { ActivityItem } from "@/types/domain";

export async function fetchActivity(year?: number, limit = 50): Promise<ActivityItem[]> {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (limit) params.set("limit", String(limit));
  const query = params.size ? `?${params.toString()}` : "";
  const result = await apiGet<{ items: ActivityItem[] }>(`/api/activity${query}`);
  return result.items;
}
