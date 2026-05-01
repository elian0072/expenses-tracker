import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";

import type { CurrentUser } from "@/types/domain";

export function AppHeader({
  user,
  showMenuButton,
  onMenuClick,
  onSignOut
}: {
  user: CurrentUser;
  showMenuButton: boolean;
  onMenuClick: () => void;
  onSignOut: () => void;
}) {
  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{ borderBottom: "1px solid", borderColor: "divider" }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {showMenuButton ? (
          <IconButton aria-label="Open navigation menu" edge="start" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
        ) : null}
        <Box sx={{ display: "grid", mr: "auto" }}>
          <Typography variant="h6" component="h1">
            Annual Expense Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Signed in as {user.display_name}
          </Typography>
        </Box>
        <Button onClick={onSignOut} startIcon={<LogoutIcon />} variant="outlined">
          Sign out
        </Button>
      </Toolbar>
    </AppBar>
  );
}
