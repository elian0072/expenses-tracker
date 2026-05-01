import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { renderWithProviders } from "../../test-utils";

const mutateAsync = vi.fn();

vi.mock("@/features/auth/api", () => ({
  useLoginMutation: () => ({
    mutateAsync,
    isPending: false
  })
}));

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => ({
    data: null
  })
}));

describe("LoginPage", () => {
  it("submits credentials", async () => {
    mutateAsync.mockResolvedValueOnce({
      id: "user-1",
      email: "owner@example.com",
      display_name: "Owner",
      is_admin: true,
      is_active: true
    });

    renderWithProviders(<LoginPage />, "/login");

    fireEvent.change(screen.getByRole("textbox", { name: /email/i }), {
      target: { value: "owner@example.com" }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "change-me-please" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "owner@example.com",
        password: "change-me-please"
      })
    );
  });
});
