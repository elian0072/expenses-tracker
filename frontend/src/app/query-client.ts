import { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  session: ["session"] as const,
  profile: ["profile"] as const,
  adminUsers: ["admin-users"] as const,
  activity: ["activity"] as const
};

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60_000,
        gcTime: 15 * 60_000,
        refetchOnMount: false,
        refetchOnWindowFocus: false
      }
    }
  });
