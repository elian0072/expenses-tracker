import { useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";

export function useResponsiveNav() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (desktop) {
      setMobileOpen(false);
    }
  }, [desktop]);

  return {
    desktop,
    mobileOpen,
    openMobileNav: () => setMobileOpen(true),
    closeMobileNav: () => setMobileOpen(false),
    toggleMobileNav: () => setMobileOpen((prev) => !prev)
  };
}
