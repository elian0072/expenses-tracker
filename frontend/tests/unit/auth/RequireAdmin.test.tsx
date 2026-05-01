import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { RequireAdmin } from "@/features/auth/RequireAdmin";
import { renderWithProviders } from "../../test-utils";

const mockSessionQuery = vi.fn();

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => mockSessionQuery()
}));

describe("RequireAdmin", () => {
  it("renders protected content when user is admin", () => {
    mockSessionQuery.mockReturnValue({
      isPending: false,
      data: {
        id: "u1",
        email: "owner@example.com",
        display_name: "Owner",
        is_admin: true,
        is_active: true
      }
    });

    renderWithProviders(
      <RequireAdmin>
        <div>Admin zone</div>
      </RequireAdmin>,
      "/users"
    );

    expect(screen.getByText("Admin zone")).toBeInTheDocument();
  });

  it("redirects non-admin users to expenses", () => {
    mockSessionQuery.mockReturnValue({
      isPending: false,
      data: {
        id: "u2",
        email: "member@example.com",
        display_name: "Member",
        is_admin: false,
        is_active: true
      }
    });

    renderWithProviders(
      <Routes>
        <Route
          path="/users"
          element={
            <RequireAdmin>
              <div>Admin zone</div>
            </RequireAdmin>
          }
        />
        <Route path="/expenses" element={<div>Expenses page</div>} />
      </Routes>,
      "/users"
    );

    expect(screen.queryByText("Admin zone")).not.toBeInTheDocument();
    expect(screen.getByText("Expenses page")).toBeInTheDocument();
  });
});

