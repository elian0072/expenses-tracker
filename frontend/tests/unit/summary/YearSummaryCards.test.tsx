import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { YearSummaryCards } from "@/features/summary/components/YearSummaryCards";
import { renderWithProviders } from "../../test-utils";

describe("YearSummaryCards", () => {
  it("shows planned and purchased totals", () => {
    renderWithProviders(
      <YearSummaryCards
        summary={{
          year: 2026,
          planned_total: "120.00",
          purchased_total: "55.50",
          canceled_count: 1,
          expense_count: 3
        }}
      />
    );

    expect(screen.getByText("Planned Total")).toBeInTheDocument();
    expect(screen.getByText("Purchased Total")).toBeInTheDocument();
    expect(screen.getByText(/120,00/)).toBeInTheDocument();
    expect(screen.getByText(/55,50/)).toBeInTheDocument();
  });
});
