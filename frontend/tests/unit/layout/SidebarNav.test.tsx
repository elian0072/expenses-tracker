import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SidebarNav } from "@/layout/SidebarNav";
import { renderWithProviders } from "../../test-utils";

describe("SidebarNav", () => {
  it("shows admin links when current user is admin", () => {
    renderWithProviders(
      <SidebarNav
        desktop={true}
        mobileOpen={false}
        onCloseMobile={() => undefined}
        user={{
          id: "u1",
          email: "owner@example.com",
          display_name: "Owner",
          is_admin: true,
          is_active: true
        }}
      />,
      "/expenses"
    );

    expect(screen.getByLabelText("Open Expenses")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Users")).toBeInTheDocument();
    expect(screen.getByLabelText("Open Activity")).toBeInTheDocument();
    expect(screen.getByLabelText("Open profile for Owner")).toBeInTheDocument();
    expect(screen.getByText("Administrator")).toBeInTheDocument();
  });

  it("hides admin links for non-admin users", () => {
    renderWithProviders(
      <SidebarNav
        desktop={true}
        mobileOpen={false}
        onCloseMobile={() => undefined}
        user={{
          id: "u2",
          email: "member@example.com",
          display_name: "Member",
          is_admin: false,
          is_active: true
        }}
      />,
      "/expenses"
    );

    expect(screen.getByLabelText("Open Expenses")).toBeInTheDocument();
    expect(screen.queryByLabelText("Open Users")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Open Activity")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Open profile for Member")).toBeInTheDocument();
    expect(screen.getByText("Standard member")).toBeInTheDocument();
  });
});
