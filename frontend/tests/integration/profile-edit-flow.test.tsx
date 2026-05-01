import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppRouter } from "@/app/router";
import { renderWithProviders } from "../test-utils";

const mockSessionQuery = vi.fn();
const mockUseProfileQuery = vi.fn();
const mockMutateAsync = vi.fn();
const mockUseUpdateProfileMutation = vi.fn();

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => mockSessionQuery()
}));

vi.mock("@/features/profile/api", () => ({
  useProfileQuery: () => mockUseProfileQuery(),
  useUpdateProfileMutation: () => mockUseUpdateProfileMutation()
}));

describe("Profile edit flow", () => {
  it("allows an authenticated user to update their own profile", async () => {
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
    mockUseProfileQuery.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        id: "u1",
        email: "owner@example.com",
        display_name: "Owner",
        is_admin: true,
        is_active: true,
        last_login_at: null
      }
    });
    mockMutateAsync.mockResolvedValue({
      id: "u1",
      email: "owner+updated@example.com",
      display_name: "Owner Updated",
      is_admin: true,
      is_active: true,
      last_login_at: null
    });
    mockUseUpdateProfileMutation.mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false
    });

    renderWithProviders(<AppRouter />, "/profile");
    fireEvent.change(await screen.findByLabelText(/display name/i), { target: { value: "Owner Updated" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "owner+updated@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        display_name: "Owner Updated",
        email: "owner+updated@example.com"
      })
    );
    expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
  });
});
