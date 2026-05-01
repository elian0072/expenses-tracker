import { Alert, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useState } from "react";

import {
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation
} from "@/features/users/api";
import { DeleteUserDialog } from "@/features/users/components/DeleteUserDialog";
import { UserFormDialog } from "@/features/users/components/UserFormDialog";
import type { UserFormPayload } from "@/features/users/components/UserFormDialog";
import { UsersTable } from "@/features/users/components/UsersTable";
import { FeedbackState } from "@/ui/FeedbackState";
import type { AdminUser } from "@/types/domain";

export function UsersPage() {
  const usersQuery = useAdminUsersQuery();
  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);
  const [feedbackState, setFeedbackState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const users = usersQuery.data ?? [];
  const loading = usersQuery.isPending;
  const hasError = usersQuery.isError;
  const pendingMutation = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  async function handleSave(payload: UserFormPayload) {
    setFeedbackState("loading");
    setFeedbackMessage("Saving user...");
    try {
      if (formMode === "edit" && editing) {
        await updateMutation.mutateAsync({ userId: editing.id, payload });
        setFeedbackMessage("User updated.");
      } else {
        await createMutation.mutateAsync({
          email: payload.email,
          password: payload.password ?? "",
          display_name: payload.display_name,
          is_admin: payload.is_admin,
          is_active: payload.is_active
        });
        setFeedbackMessage("User created.");
      }
      setFeedbackState("success");
      setFormOpen(false);
      setEditing(null);
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Unable to save user.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setFeedbackState("loading");
    setFeedbackMessage("Deleting user...");
    try {
      await deleteMutation.mutateAsync(deleting.id);
      setFeedbackState("success");
      setFeedbackMessage("User deleted.");
      setDeleting(null);
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Unable to delete user.");
    }
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <div>
            <Typography variant="h4">Users</Typography>
            <Typography color="text.secondary">Manage accounts, roles, and access status.</Typography>
          </div>
          <Button
            variant="contained"
            onClick={() => {
              setFormMode("create");
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add User
          </Button>
        </CardContent>
      </Card>

      <FeedbackState state={feedbackState} message={feedbackMessage} />

      {loading ? <Alert severity="info">Loading users...</Alert> : null}
      {hasError ? <Alert severity="error">Unable to load users.</Alert> : null}

      {!loading && !hasError && users.length === 0 ? (
        <Typography color="text.secondary">No users found yet. Add the first account to get started.</Typography>
      ) : null}

      {!loading && !hasError && users.length > 0 ? (
        <Card>
          <CardContent>
            <UsersTable
              users={users}
              onEdit={(user) => {
                setFormMode("edit");
                setEditing(user);
                setFormOpen(true);
              }}
              onDelete={(user) => setDeleting(user)}
            />
          </CardContent>
        </Card>
      ) : null}

      <UserFormDialog
        open={formOpen}
        mode={formMode}
        user={formMode === "edit" ? editing ?? undefined : undefined}
        pending={pendingMutation}
        onCancel={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
      />

      <DeleteUserDialog
        open={deleting !== null}
        email={deleting?.email ?? ""}
        pending={deleteMutation.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </Stack>
  );
}
