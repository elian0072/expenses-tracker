import { useMutation, useQueryClient } from "@tanstack/react-query";

import { login, logout } from "@/services/auth";
import type { CurrentUser } from "@/types/domain";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      login(email, password),
    onSuccess: (user: CurrentUser) => {
      queryClient.setQueryData(["session"], user);
    }
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(["session"], null);
      queryClient.removeQueries({ queryKey: ["expenses"] });
      queryClient.removeQueries({ queryKey: ["summary"] });
      queryClient.removeQueries({ queryKey: ["activity"] });
      queryClient.removeQueries({ queryKey: ["admin-users"] });
    }
  });
}
