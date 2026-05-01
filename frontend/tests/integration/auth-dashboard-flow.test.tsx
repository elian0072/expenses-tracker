import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppRouter } from "@/app/router";
import { renderWithProviders } from "../test-utils";

const mockSessionQuery = vi.fn();

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => mockSessionQuery()
}));

vi.mock("@/features/expenses/pages/ExpensesPage", () => ({
  ExpensesPage: () => <div>Expenses Mock Page</div>
}));

vi.mock("@/features/activity/pages/ActivityPage", () => ({
  ActivityPage: () => <div>Activity Mock Page</div>
}));

vi.mock("@/features/users/pages/UsersPage", () => ({
  UsersPage: () => <div>Users Mock Page</div>
}));

vi.mock("@/features/profile/pages/ProfilePage", () => ({
  ProfilePage: () => <div>Profile Mock Page</div>
}));

describe("Auth dashboard flow", () => {
  it("redirects unauthenticated visitors to login", async () => {
    mockSessionQuery.mockReturnValue({
      isPending: false,
      data: null
    });

    renderWithProviders(<AppRouter />, "/");
    expect(await screen.findByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  });

  it("redirects non-admin users away from admin pages", async () => {
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

    renderWithProviders(<AppRouter />, "/users");
    expect(await screen.findByText("Expenses Mock Page")).toBeInTheDocument();
    expect(screen.queryByText("Users Mock Page")).not.toBeInTheDocument();
  });

  it("navigates to profile when clicking the sidebar identity block", async () => {
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

    renderWithProviders(<AppRouter />, "/expenses");
    fireEvent.click(await screen.findByLabelText("Open profile for Member"));
    expect(await screen.findByText("Profile Mock Page")).toBeInTheDocument();
  });
});
