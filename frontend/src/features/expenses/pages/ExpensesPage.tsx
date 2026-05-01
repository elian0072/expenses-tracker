import { Alert, Card, CardContent, Stack, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  useCreateExpenseMutation,
  useDeleteExpenseMutation,
  useExpensesQuery,
  useUpdateExpenseMutation,
  useYearSummaryQuery
} from "@/features/expenses/api";
import { DeleteExpenseDialog } from "@/features/expenses/components/DeleteExpenseDialog";
import { ExpenseFormDialog } from "@/features/expenses/components/ExpenseFormDialog";
import type { ExpenseFormPayload } from "@/features/expenses/components/ExpenseFormDialog";
import { ExpensesTable } from "@/features/expenses/components/ExpensesTable";
import { ExpensesToolbar } from "@/features/expenses/components/ExpensesToolbar";
import { StatusFilter } from "@/features/expenses/components/StatusFilter";
import { YearSummaryCards } from "@/features/summary/components/YearSummaryCards";
import { FeedbackState } from "@/ui/FeedbackState";
import type { Expense, ExpenseStatus } from "@/types/domain";
import { startRouteTiming } from "@/utils/performance";

export function ExpensesPage() {
  const location = useLocation();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "all">("all");
  const [feedbackState, setFeedbackState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [routeDuration, setRouteDuration] = useState<number | null>(null);
  const endTimingRef = useRef<(() => number) | null>(null);

  const expensesQuery = useExpensesQuery(year, statusFilter);
  const summaryQuery = useYearSummaryQuery(year);
  const createMutation = useCreateExpenseMutation(year);
  const updateMutation = useUpdateExpenseMutation(year);
  const deleteMutation = useDeleteExpenseMutation(year);

  const loading = expensesQuery.isPending || summaryQuery.isPending;
  const hasError = expensesQuery.isError || summaryQuery.isError;
  const expenses = expensesQuery.data ?? [];
  const empty = !loading && !hasError && expenses.length === 0;
  const accessDenied = Boolean((location.state as { accessDenied?: boolean } | null)?.accessDenied);

  useEffect(() => {
    endTimingRef.current = startRouteTiming(`/expenses?year=${year}`);
    setRouteDuration(null);
  }, [year, statusFilter]);

  useEffect(() => {
    if (!loading && endTimingRef.current) {
      const duration = endTimingRef.current();
      endTimingRef.current = null;
      setRouteDuration(duration);
    }
  }, [loading]);

  async function handleSave(payload: ExpenseFormPayload & { version?: number }) {
    setFeedbackState("loading");
    setFeedbackMessage("Saving expense...");
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          expenseId: editing.id,
          payload: { ...payload, version: editing.version }
        });
        setFeedbackMessage("Expense updated.");
      } else {
        await createMutation.mutateAsync(payload);
        setFeedbackMessage("Expense created.");
      }
      setFeedbackState("success");
      setEditing(null);
      setShowCreate(false);
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Unable to save expense.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setFeedbackState("loading");
    setFeedbackMessage("Deleting expense...");
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setFeedbackState("success");
      setFeedbackMessage("Expense deleted.");
      setDeleting(null);
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Unable to delete expense.");
    }
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4">Expenses Dashboard</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Plan, update, and track household expenses.
          </Typography>
          <ExpensesToolbar year={year} onYearChange={setYear} onAddExpense={() => setShowCreate(true)} />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </CardContent>
      </Card>

      <FeedbackState state={feedbackState} message={feedbackMessage} />
      {accessDenied ? <Alert severity="warning">This section is restricted to administrators.</Alert> : null}

      {loading ? <Alert severity="info">Loading annual data...</Alert> : null}
      {hasError ? <Alert severity="error">Unable to load annual data.</Alert> : null}

      {!loading && !hasError && summaryQuery.data ? <YearSummaryCards summary={summaryQuery.data} /> : null}

      {!loading && !hasError ? (
        <Card>
          <CardContent>
            {empty ? (
              <Typography color="text.secondary">
                No expenses yet for this view. Create the first one to start planning.
              </Typography>
            ) : (
              <ExpensesTable expenses={expenses} onEdit={setEditing} onDelete={setDeleting} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {!loading && routeDuration !== null ? (
        <Typography variant="caption" color="text.secondary">
          View loaded in {Math.round(routeDuration)}ms
        </Typography>
      ) : null}

      {showCreate || editing ? (
        <ExpenseFormDialog
          expense={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setEditing(null);
            setShowCreate(false);
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteExpenseDialog title={deleting.title} onConfirm={handleDelete} onCancel={() => setDeleting(null)} />
      ) : null}
    </Stack>
  );
}
