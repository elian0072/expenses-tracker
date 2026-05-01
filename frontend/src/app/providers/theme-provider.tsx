import { CssBaseline, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";

import { dashboardTheme } from "@/theme/dashboard-theme";

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={dashboardTheme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
