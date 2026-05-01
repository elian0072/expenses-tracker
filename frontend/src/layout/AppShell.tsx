import { Box, CircularProgress, Container, Toolbar } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";

import { useLogoutMutation } from "@/features/auth/api";
import { useSessionQuery } from "@/features/auth/session";
import { AppHeader } from "@/layout/AppHeader";
import { SidebarNav } from "@/layout/SidebarNav";
import { useResponsiveNav } from "@/layout/useResponsiveNav";
import { drawerWidth } from "@/theme/dashboard-theme";

export function AppShell() {
  const navigate = useNavigate();
  const nav = useResponsiveNav();
  const logoutMutation = useLogoutMutation();
  const sessionQuery = useSessionQuery();

  const user = sessionQuery.data;
  if (!user) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    nav.closeMobileNav();
    navigate("/login", { replace: true });
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <SidebarNav
        desktop={nav.desktop}
        mobileOpen={nav.mobileOpen}
        onCloseMobile={nav.closeMobileNav}
        user={user}
      />
      <Box
        component="main"
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minWidth: 0,
          ml: { lg: `${drawerWidth}px` }
        }}
      >
        <AppHeader
          user={user}
          showMenuButton={!nav.desktop}
          onMenuClick={nav.toggleMobileNav}
          onSignOut={() => void handleLogout()}
        />
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
