import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ProfilePage } from "@/features/profile/pages/ProfilePage";
import { renderWithProviders } from "../../test-utils";

const mockUseProfileQuery = vi.fn();
const mockMutateAsync = vi.fn();
const mockUseUpdateProfileMutation = vi.fn();

vi.mock("@/features/profile/api", () => ({
  useProfileQuery: () => mockUseProfileQuery(),
  useUpdateProfileMutation: () => mockUseUpdateProfileMutation()
}));

describe("ProfilePage", () => {
  it("renders loading and error states", () => {
    mockUseUpdateProfileMutation.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
    mockUseProfileQuery.mockReturnValueOnce({
      isPending: true,
      isError: false,
      data: null
    });

    const loadingView = renderWithProviders(<ProfilePage />, "/profile");
    expect(screen.getByText("Loading profile...")).toBeInTheDocument();
    loadingView.unmount();

    mockUseProfileQuery.mockReturnValueOnce({
      isPending: false,
      isError: true,
      data: null
    });

    renderWithProviders(<ProfilePage />, "/profile");
    expect(screen.getByText("Unable to load profile.")).toBeInTheDocument();
  });

  it("submits updated profile data and shows success feedback", async () => {
    mockMutateAsync.mockResolvedValue({
      id: "u1",
      email: "updated@example.com",
      display_name: "Updated Owner",
      is_admin: true,
      is_active: true,
      last_login_at: null
    });
    mockUseUpdateProfileMutation.mockReturnValue({ mutateAsync: mockMutateAsync, isPending: false });
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

    renderWithProviders(<ProfilePage />, "/profile");
    fireEvent.change(screen.getByLabelText(/display name/i), { target: { value: "Updated Owner" } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: "updated@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() =>
      expect(mockMutateAsync).toHaveBeenCalledWith({
        display_name: "Updated Owner",
        email: "updated@example.com"
      })
    );
    expect(await screen.findByText("Profile updated.")).toBeInTheDocument();
  });
});
