import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppRouter } from "@/app/router";
import { renderWithProviders } from "../test-utils";

const mockSessionQuery = vi.fn();

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => mockSessionQuery()
}));

vi.mock("@/features/users/pages/UsersPage", () => ({
  UsersPage: () => <div>Users Mock Page</div>
}));

describe("Admin users flow", () => {
  it("allows admin users to access /users", async () => {
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

    renderWithProviders(<AppRouter />, "/users");
    expect(await screen.findByText("Users Mock Page")).toBeInTheDocument();
  });
});

