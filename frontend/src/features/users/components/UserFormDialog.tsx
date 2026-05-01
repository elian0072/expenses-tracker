import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Switch,
  TextField
} from "@mui/material";
import { useEffect, useState } from "react";

import type { AdminUser } from "@/types/domain";

export type UserFormPayload = {
  email: string;
  display_name: string;
  password?: string;
  is_admin: boolean;
  is_active: boolean;
};

export function UserFormDialog({
  open,
  mode,
  user,
  pending,
  onCancel,
  onSubmit
}: {
  open: boolean;
  mode: "create" | "edit";
  user?: AdminUser;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (payload: UserFormPayload) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (mode === "edit" && user) {
      setEmail(user.email);
      setDisplayName(user.display_name);
      setPassword("");
      setIsAdmin(user.is_admin);
      setIsActive(user.is_active);
      return;
    }

    setEmail("");
    setDisplayName("");
    setPassword("");
    setIsAdmin(false);
    setIsActive(true);
  }, [mode, user, open]);

  function canSubmit() {
    if (!email.trim() || !displayName.trim()) return false;
    if (mode === "create") return password.length >= 8;
    if (password.length > 0 && password.length < 8) return false;
    return true;
  }

  async function handleSubmit() {
    const payload: UserFormPayload = {
      email: email.trim(),
      display_name: displayName.trim(),
      is_admin: isAdmin,
      is_active: isActive
    };
    if (password.trim()) {
      payload.password = password.trim();
    }
    await onSubmit(payload);
  }

  return (
    <Dialog open={open} onClose={onCancel} fullWidth maxWidth="sm" aria-labelledby="user-form-title">
      <DialogTitle id="user-form-title">{mode === "create" ? "Add User" : "Edit User"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Display Name"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
          />
          <TextField
            label={mode === "create" ? "Password" : "Password (leave blank to keep current)"}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required={mode === "create"}
            helperText={mode === "create" ? "At least 8 characters." : "Set only when you need to change it."}
          />
          <FormControlLabel
            control={<Switch checked={isAdmin} onChange={(event) => setIsAdmin(event.target.checked)} />}
            label="Admin rights"
          />
          <FormControlLabel
            control={<Switch checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />}
            label="Active account"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button onClick={() => void handleSubmit()} variant="contained" disabled={pending || !canSubmit()}>
          {pending ? "Saving..." : mode === "create" ? "Create user" : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

