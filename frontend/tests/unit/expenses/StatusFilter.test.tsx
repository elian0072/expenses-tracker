import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { StatusFilter } from "@/features/expenses/components/StatusFilter";
import { renderWithProviders } from "../../test-utils";

describe("StatusFilter", () => {
  it("changes filter value", () => {
    const onChange = vi.fn();
    renderWithProviders(<StatusFilter value="all" onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Purchased" }));
    expect(onChange).toHaveBeenCalledWith("purchased");
  });
});
