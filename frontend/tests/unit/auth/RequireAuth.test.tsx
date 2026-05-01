import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { renderWithProviders } from "../../test-utils";

const mockSessionQuery = vi.fn();

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => mockSessionQuery()
}));

describe("RequireAuth", () => {
  it("renders protected content when authenticated", () => {
    mockSessionQuery.mockReturnValue({
      isPending: false,
      data: {
        id: "u1",
        email: "owner@example.com",
        display_name: "Owner",
        is_admin: false,
        is_active: true
      }
    });

    renderWithProviders(
      <RequireAuth>
        <div>Secret page</div>
      </RequireAuth>,
      "/expenses"
    );

    expect(screen.getByText("Secret page")).toBeInTheDocument();
  });
});
