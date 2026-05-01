import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpensesPage } from "@/features/expenses/pages/ExpensesPage";
import { renderWithProviders } from "../test-utils";

const createMutateAsync = vi.fn();
const updateMutateAsync = vi.fn();
const deleteMutateAsync = vi.fn();

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
    mutateAsync: updateMutateAsync
  }),
  useDeleteExpenseMutation: () => ({
    mutateAsync: deleteMutateAsync
  })
}));

describe("Expenses CRUD integration", () => {
  it("creates an expense from dashboard dialog", async () => {
    createMutateAsync.mockResolvedValueOnce(undefined);

    renderWithProviders(<ExpensesPage />);
    fireEvent.click(screen.getByRole("button", { name: "Add expense" }));
    fireEvent.change(await screen.findByRole("textbox", { name: /title/i }), {
      target: { value: "Fuel" }
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /amount/i }), {
      target: { value: "80" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(createMutateAsync).toHaveBeenCalledWith({
        title: "Fuel",
        amount: "80",
        status: "planned",
        notes: "",
        version: undefined
      })
    );
  });
});
