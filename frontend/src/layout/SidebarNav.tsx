import EventNoteIcon from "@mui/icons-material/EventNote";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import {
  Box,
  CardMedia,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography
} from "@mui/material";
import type { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";

import logoExpenses from "@/assets/logo-expenses.svg";
import type { CurrentUser } from "@/types/domain";
import { drawerWidth } from "@/theme/dashboard-theme";

type Props = {
  desktop: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  user: CurrentUser;
};

export function SidebarNav({ desktop, mobileOpen, onCloseMobile, user }: Props) {
  const location = useLocation();
  const items: Array<{ key: string; label: string; href: string; icon: ReactNode }> = [
    { key: "expenses", label: "Expenses", href: "/expenses", icon: <ReceiptLongIcon fontSize="small" /> },
  ];
  if (user.is_admin) {
    items.push({ key: "users", label: "Users", href: "/users", icon: <PeopleAltIcon fontSize="small" /> });
    items.push({ key: "activity", label: "Activity", href: "/activity", icon: <EventNoteIcon fontSize="small" /> });
  }

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ alignItems: "center", gap: 1.25 }}>
        <CardMedia
          component="img"
          image={logoExpenses}
          alt="Expense tracker logo"
          sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: "cover" }}
        />
        <Box sx={{ display: "grid" }}>
          <Typography variant="h6" component="span" sx={{ lineHeight: 1.1 }}>
            Dashboard
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Expense Tracker
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 1 }}>
        {items.map((item) => (
          <ListItemButton
            key={item.key}
            component={NavLink}
            to={item.href}
            selected={location.pathname === item.href}
            onClick={onCloseMobile}
            sx={{ borderRadius: 2, mb: 0.5 }}
            aria-label={`Open ${item.label}`}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: "auto", px: 1.5, pb: 1.5 }}>
        <Divider sx={{ mb: 1 }} />
        <ListItemButton
          component={NavLink}
          to="/profile"
          selected={location.pathname === "/profile"}
          onClick={onCloseMobile}
          sx={{ borderRadius: 2, alignItems: "flex-start", py: 1 }}
          aria-label={`Open profile for ${user.display_name}`}
        >
          <ListItemIcon sx={{ minWidth: 36, mt: 0.25 }}>
            <PersonOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={user.display_name}
            secondary={user.is_admin ? "Administrator" : "Standard member"}
            primaryTypographyProps={{ fontWeight: 600 }}
            secondaryTypographyProps={{ variant: "caption" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  if (desktop) {
    return (
      <Drawer
        variant="permanent"
        PaperProps={{
          sx: {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider"
          }
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onCloseMobile}
      ModalProps={{ keepMounted: true }}
      PaperProps={{ sx: { width: drawerWidth, boxSizing: "border-box" } }}
    >
      {content}
    </Drawer>
  );
}
