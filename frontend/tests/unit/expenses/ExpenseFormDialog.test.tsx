import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ExpenseFormDialog } from "@/features/expenses/components/ExpenseFormDialog";
import { renderWithProviders } from "../../test-utils";

describe("ExpenseFormDialog", () => {
  it("submits entered values", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onCancel = vi.fn();

    renderWithProviders(<ExpenseFormDialog onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(await screen.findByRole("textbox", { name: /title/i }), {
      target: { value: "School fees" }
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: /amount/i }), {
      target: { value: "150" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        title: "School fees",
        amount: "150",
        status: "planned",
        notes: "",
        version: undefined
      })
    );
  });
});
