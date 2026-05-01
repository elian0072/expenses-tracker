import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AppShell } from "@/layout/AppShell";
import { renderWithProviders } from "../test-utils";

const mockSessionQuery = vi.fn();
const mockResponsiveNav = vi.fn();

vi.mock("@/features/auth/session", () => ({
  useSessionQuery: () => mockSessionQuery()
}));

vi.mock("@/features/auth/api", () => ({
  useLogoutMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue(undefined)
  })
}));

vi.mock("@/layout/useResponsiveNav", () => ({
  useResponsiveNav: () => mockResponsiveNav()
}));

describe("Dashboard shell regression", () => {
  function baseNavState(overrides?: Partial<ReturnType<typeof mockResponsiveNav>>) {
    return {
      desktop: true,
      mobileOpen: false,
      openMobileNav: vi.fn(),
      closeMobileNav: vi.fn(),
      toggleMobileNav: vi.fn(),
      ...overrides
    };
  }

  it("shows signed-in identity and navigation links", () => {
    mockSessionQuery.mockReturnValue({
      data: {
        id: "user-1",
        email: "owner@example.com",
        display_name: "Owner",
        is_admin: true,
        is_active: true
      }
    });
    mockResponsiveNav.mockReturnValue(baseNavState());

    renderWithProviders(<AppShell />, "/expenses");

    expect(screen.getByText("Signed in as Owner")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Expenses")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Users")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Activity")).toBeInTheDocument();
    expect(screen.getByLabelText("Open profile for Owner")).toBeInTheDocument();
  });

  it("keeps identity navigation visible in mobile drawer mode", () => {
    mockSessionQuery.mockReturnValue({
      data: {
        id: "user-1",
        email: "owner@example.com",
        display_name: "Owner",
        is_admin: true,
        is_active: true
      }
    });
    mockResponsiveNav.mockReturnValue(baseNavState({ desktop: false, mobileOpen: true }));

    renderWithProviders(<AppShell />, "/expenses");
    expect(screen.getByLabelText("Open profile for Owner")).toBeInTheDocument();
  });
});
