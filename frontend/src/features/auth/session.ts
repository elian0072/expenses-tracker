import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/app/query-client";
import { me } from "@/services/auth";
import type { CurrentUser } from "@/types/domain";

export async function fetchSessionUser(): Promise<CurrentUser | null> {
  try {
    return await me();
  } catch {
    return null;
  }
}

export function useSessionQuery() {
  return useQuery({
    queryKey: queryKeys.session,
    queryFn: fetchSessionUser,
    retry: false,
    staleTime: 5 * 60_000
  });
}
