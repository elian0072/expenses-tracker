import { createTheme } from "@mui/material/styles";

export const drawerWidth = 264;

export const dashboardTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2dd4bf"
    },
    secondary: {
      main: "#38bdf8"
    },
    background: {
      default: "#0b1220",
      paper: "#111827"
    },
    success: {
      main: "#22c55e"
    },
    warning: {
      main: "#f59e0b"
    },
    error: {
      main: "#ef4444"
    }
  },
  shape: {
    borderRadius: 14
  },
  typography: {
    fontFamily: '"Atkinson Hyperlegible Next", "Segoe UI", "Inter", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#0f172a",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          boxShadow: "0 16px 40px rgba(2, 6, 23, 0.45)"
        }
      }
    }
  }
});
