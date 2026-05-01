import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpensesPage } from "@/features/expenses/pages/ExpensesPage";
import { renderWithProviders } from "../test-utils";

const createMutateAsync = vi.fn();

vi.mock("@/features/expenses/api", () => ({
  useExpensesQuery: () => ({
    isPending: false,
    isError: false,
    data: []
  }),
  useYearSummaryQuery: () => ({
    isPending: false,
    isError: false,
    data: {
      year: 2026,
      planned_total: "0",
      purchased_total: "0",
      canceled_count: 0,
      expense_count: 0
    }
  }),
  useCreateExpenseMutation: () => ({
    mutateAsync: createMutateAsync
  }),
  useUpdateExpenseMutation: () => ({
    mutateAsync: vi.fn()
  }),
  useDeleteExpenseMutation: () => ({
    mutateAsync: vi.fn()
  })
}));

describe("Expenses conflict regression", () => {
  it("shows error feedback when save fails", async () => {
    createMutateAsync.mockRejectedValueOnce(new Error("Version conflict"));

    renderWithProviders(<ExpensesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    fireEvent.change(await screen.findByRole("textbox", { name: /title/i }), {
      target: { value: "Rent" }
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /amount/i }), {
      target: { value: "1000" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(screen.getByText("Version conflict")).toBeInTheDocument());
  });
});
