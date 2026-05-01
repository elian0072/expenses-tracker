import { Box, CircularProgress } from "@mui/material";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useSessionQuery } from "@/features/auth/session";

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const sessionQuery = useSessionQuery();

  if (sessionQuery.isPending) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress size={30} />
      </Box>
    );
  }

  if (!sessionQuery.data) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
