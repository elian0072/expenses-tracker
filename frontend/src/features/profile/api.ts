import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/app/query-client";
import { apiGet, apiPatch } from "@/services/api-client";
import type { UserProfile } from "@/types/domain";

export type ProfileUpdateInput = {
  email?: string;
  display_name?: string;
};

export async function fetchProfile(): Promise<UserProfile> {
  return apiGet<UserProfile>("/api/profile");
}

export async function updateProfile(payload: ProfileUpdateInput): Promise<UserProfile> {
  return apiPatch<UserProfile>("/api/profile", payload);
}

export function useProfileQuery() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}
