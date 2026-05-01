import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpensesPage } from "@/features/expenses/pages/ExpensesPage";
import { renderWithProviders } from "../test-utils";

vi.mock("@/features/expenses/api", () => ({
  useExpensesQuery: () => ({
    isPending: false,
    isError: false,
    data: [
      {
        id: "e1",
        title: "Laptop",
        amount: "950",
        planning_year: 2026,
        target_date: null,
        notes: null,
        status: "planned",
        version: 1,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z"
      }
    ]
  }),
  useYearSummaryQuery: () => ({
    isPending: false,
    isError: false,
    data: {
      year: 2026,
      planned_total: "950",
      purchased_total: "100",
      canceled_count: 0,
      expense_count: 1
    }
  }),
  useCreateExpenseMutation: () => ({
    mutateAsync: vi.fn()
  }),
  useUpdateExpenseMutation: () => ({
    mutateAsync: vi.fn()
  }),
  useDeleteExpenseMutation: () => ({
    mutateAsync: vi.fn()
  })
}));

describe("Summary and filter integration", () => {
  it("renders KPI cards and status filter", () => {
    renderWithProviders(<ExpensesPage />);
    expect(screen.getByText("Planned Total")).toBeInTheDocument();
    expect(screen.getByText("Purchased Total")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Purchased" }));
    expect(screen.getByRole("button", { name: "Purchased" })).toBeInTheDocument();
  });
});
