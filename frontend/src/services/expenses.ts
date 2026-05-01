import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api-client";
import type { Expense, ExpenseStatus, YearSummary } from "@/types/domain";

export type ExpenseInput = {
  title: string;
  amount: string;
  status: ExpenseStatus;
  target_date?: string | null;
  notes?: string | null;
};

export type ExpenseUpdateInput = Partial<ExpenseInput> & { version: number };

export async function fetchExpenses(year: number, status?: ExpenseStatus): Promise<Expense[]> {
  const search = status ? `?status=${status}` : "";
  const result = await apiGet<{ year: number; items: Expense[] }>(`/api/years/${year}/expenses${search}`);
  return result.items;
}

export async function createExpense(year: number, payload: ExpenseInput): Promise<Expense> {
  return apiPost<Expense>(`/api/years/${year}/expenses`, payload);
}

export async function updateExpense(expenseId: string, payload: ExpenseUpdateInput): Promise<Expense> {
  return apiPatch<Expense>(`/api/expenses/${expenseId}`, payload);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await apiDelete(`/api/expenses/${expenseId}`);
}

export async function fetchYearSummary(year: number): Promise<YearSummary> {
  return apiGet<YearSummary>(`/api/years/${year}/summary`);
}
