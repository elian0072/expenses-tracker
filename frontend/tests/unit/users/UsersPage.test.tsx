import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { UsersPage } from "@/features/users/pages/UsersPage";
import { renderWithProviders } from "../../test-utils";

const mockUseAdminUsersQuery = vi.fn();

vi.mock("@/features/users/api", () => ({
  useAdminUsersQuery: () => mockUseAdminUsersQuery(),
  useCreateAdminUserMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAdminUserMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteAdminUserMutation: () => ({ mutateAsync: vi.fn(), isPending: false })
}));

describe("UsersPage", () => {
  it("renders loading and error states", () => {
    mockUseAdminUsersQuery.mockReturnValueOnce({
      isPending: true,
      isError: false,
      data: []
    });
    const loadingView = renderWithProviders(<UsersPage />, "/users");
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
    loadingView.unmount();

    mockUseAdminUsersQuery.mockReturnValueOnce({
      isPending: false,
      isError: true,
      data: []
    });
    renderWithProviders(<UsersPage />, "/users");
    expect(screen.getByText("Unable to load users.")).toBeInTheDocument();
  });

  it("renders empty state and opens add-user dialog", () => {
    mockUseAdminUsersQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: []
    });

    renderWithProviders(<UsersPage />, "/users");
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("No users found yet. Add the first account to get started.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add User" }));
    expect(screen.getByRole("heading", { name: "Add User" })).toBeInTheDocument();
  });
});
