import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  fetchYearSummary,
  updateExpense
} from "@/services/expenses";
import type { ExpenseInput, ExpenseUpdateInput } from "@/services/expenses";
import type { ExpenseStatus } from "@/types/domain";

export function useExpensesQuery(year: number, status: ExpenseStatus | "all") {
  return useQuery({
    queryKey: ["expenses", year, status],
    queryFn: () => fetchExpenses(year, status === "all" ? undefined : status),
    staleTime: 2 * 60_000,
    placeholderData: (previousData) => previousData
  });
}

export function useYearSummaryQuery(year: number) {
  return useQuery({
    queryKey: ["summary", year],
    queryFn: () => fetchYearSummary(year),
    staleTime: 2 * 60_000,
    placeholderData: (previousData) => previousData
  });
}

export function useCreateExpenseMutation(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ExpenseInput) => createExpense(year, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses", year] });
      await queryClient.invalidateQueries({ queryKey: ["summary", year] });
    }
  });
}

export function useUpdateExpenseMutation(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, payload }: { expenseId: string; payload: ExpenseUpdateInput }) =>
      updateExpense(expenseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses", year] });
      await queryClient.invalidateQueries({ queryKey: ["summary", year] });
    }
  });
}

export function useDeleteExpenseMutation(year: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(expenseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["expenses", year] });
      await queryClient.invalidateQueries({ queryKey: ["summary", year] });
    }
  });
}
