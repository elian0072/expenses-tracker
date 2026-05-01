import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpensesTable } from "@/features/expenses/components/ExpensesTable";
import { renderWithProviders } from "../../test-utils";
import type { Expense } from "@/types/domain";

const expense: Expense = {
  id: "exp-1",
  title: "Internet",
  amount: "49.90",
  planning_year: 2026,
  target_date: null,
  notes: null,
  status: "planned",
  version: 1,
  created_at: "2026-01-01T12:00:00Z",
  updated_at: "2026-01-01T12:00:00Z"
};

describe("ExpensesTable", () => {
  it("renders rows and emits actions", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(<ExpensesTable expenses={[expense]} onEdit={onEdit} onDelete={onDelete} />);

    expect(screen.getByText("Internet")).toBeInTheDocument();
    expect(screen.getByText(/49,90/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onEdit).toHaveBeenCalledWith(expense);
    expect(onDelete).toHaveBeenCalledWith(expense);
  });
});
