import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ActivityPage } from "@/features/activity/pages/ActivityPage";
import { renderWithProviders } from "../../test-utils";

const fetchActivityMock = vi.fn().mockResolvedValue([]);

vi.mock("@/services/activity", () => ({
  fetchActivity: (...args: unknown[]) => fetchActivityMock(...args)
}));

describe("ActivityPage", () => {
  it("renders heading", async () => {
    renderWithProviders(<ActivityPage />, "/activity");
    expect(await screen.findByText("Activity History")).toBeInTheDocument();
    expect(fetchActivityMock).toHaveBeenCalledWith(new Date().getFullYear(), 50);
  });
});
