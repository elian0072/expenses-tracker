import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import logoExpenses from "@/assets/logo-expenses.svg";
import { useLoginMutation } from "@/features/auth/api";
import { useSessionQuery } from "@/features/auth/session";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionQuery = useSessionQuery();
  const loginMutation = useLoginMutation();
  const [email, setEmail] = useState("owner@example.com");
  const [password, setPassword] = useState("change-me-please");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  if (sessionQuery.data) {
    return <Navigate to="/expenses" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate(nextPath && nextPath !== "/login" ? nextPath : "/expenses", { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to sign in.");
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: "radial-gradient(circle at top right, #155e75 0%, #0b1220 45%)"
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent>
          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <div>
              <Box
                component="img"
                src={logoExpenses}
                alt="Expense tracker logo"
                sx={{ width: 52, height: 52, borderRadius: 2, mb: 1, display: "block" }}
              />
              <Typography variant="h4">Sign in</Typography>
              <Typography color="text.secondary">Access your household dashboard.</Typography>
            </div>

            <TextField
              id="login-email"
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <TextField
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Button type="submit" variant="contained" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
