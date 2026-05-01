import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/app/query-client";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api-client";
import type { AdminUser } from "@/types/domain";

export type AdminUserInput = {
  email: string;
  password: string;
  display_name: string;
  is_admin: boolean;
  is_active: boolean;
};

export type AdminUserUpdateInput = Partial<AdminUserInput>;

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const result = await apiGet<{ items: AdminUser[] }>("/api/admin/users");
  return result.items;
}

export async function createAdminUser(payload: AdminUserInput): Promise<AdminUser> {
  return apiPost<AdminUser>("/api/admin/users", payload);
}

export async function updateAdminUser(userId: string, payload: AdminUserUpdateInput): Promise<AdminUser> {
  return apiPatch<AdminUser>(`/api/admin/users/${userId}`, payload);
}

export async function deleteAdminUser(userId: string): Promise<void> {
  await apiDelete(`/api/admin/users/${userId}`);
}

export function useAdminUsersQuery() {
  return useQuery({
    queryKey: queryKeys.adminUsers,
    queryFn: fetchAdminUsers,
    staleTime: 60_000,
    placeholderData: (previousData) => previousData
  });
}

export function useCreateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}

export function useUpdateAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminUserUpdateInput }) =>
      updateAdminUser(userId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      await queryClient.invalidateQueries({ queryKey: queryKeys.session });
    }
  });
}

export function useDeleteAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    }
  });
}
