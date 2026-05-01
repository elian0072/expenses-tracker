import { Box, CircularProgress } from "@mui/material";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { RequireAdmin } from "@/features/auth/RequireAdmin";
import { useSessionQuery } from "@/features/auth/session";

const LoginPage = lazy(() =>
  import("@/features/auth/pages/LoginPage").then((module) => ({ default: module.LoginPage }))
);
const AppShell = lazy(() =>
  import("@/layout/AppShell").then((module) => ({ default: module.AppShell }))
);
const ExpensesPage = lazy(() =>
  import("@/features/expenses/pages/ExpensesPage").then((module) => ({ default: module.ExpensesPage }))
);
const ActivityPage = lazy(() =>
  import("@/features/activity/pages/ActivityPage").then((module) => ({ default: module.ActivityPage }))
);
const UsersPage = lazy(() =>
  import("@/features/users/pages/UsersPage").then((module) => ({ default: module.UsersPage }))
);
const ProfilePage = lazy(() =>
  import("@/features/profile/pages/ProfilePage").then((module) => ({ default: module.ProfilePage }))
);

function RouteFallback() {
  return (
    <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
      <CircularProgress size={28} />
    </Box>
  );
}

function RootRedirect() {
  const sessionQuery = useSessionQuery();
  if (sessionQuery.isPending) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress size={30} />
      </Box>
    );
  }
  return <Navigate to={sessionQuery.data ? "/expenses" : "/login"} replace />;
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          }
        >
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/users"
            element={
              <RequireAdmin>
                <UsersPage />
              </RequireAdmin>
            }
          />
          <Route
            path="/activity"
            element={
              <RequireAdmin>
                <ActivityPage />
              </RequireAdmin>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
