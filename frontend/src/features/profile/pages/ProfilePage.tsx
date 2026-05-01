import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { useProfileQuery, useUpdateProfileMutation } from "@/features/profile/api";
import { ApiError } from "@/services/api-client";
import { FeedbackState } from "@/ui/FeedbackState";

export function ProfilePage() {
  const profileQuery = useProfileQuery();
  const updateMutation = useUpdateProfileMutation();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    if (!profileQuery.data) return;
    setDisplayName(profileQuery.data.display_name);
    setEmail(profileQuery.data.email);
  }, [profileQuery.data?.id, profileQuery.data?.display_name, profileQuery.data?.email]);

  const currentProfile = profileQuery.data;
  const normalizedDisplayName = displayName.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const isDirty =
    !!currentProfile &&
    (normalizedDisplayName !== currentProfile.display_name || normalizedEmail !== currentProfile.email);
  const isSubmitting = updateMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!currentProfile || !isDirty || isSubmitting) return;

    setFeedbackState("loading");
    setFeedbackMessage("Saving profile...");

    try {
      await updateMutation.mutateAsync({
        display_name: normalizedDisplayName,
        email: normalizedEmail
      });
      setFeedbackState("success");
      setFeedbackMessage("Profile updated.");
    } catch (error) {
      setFeedbackState("error");
      if (error instanceof ApiError && error.status === 409) {
        setFeedbackMessage("This email address is already in use.");
      } else if (error instanceof ApiError && error.status === 400) {
        setFeedbackMessage("Please provide a valid name and email address.");
      } else {
        setFeedbackMessage("Unable to update profile right now.");
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4">My Profile</Typography>
          <Typography color="text.secondary">
            Update your display name and email address used in the dashboard.
          </Typography>
        </CardContent>
      </Card>

      <FeedbackState state={feedbackState} message={feedbackMessage} />

      {profileQuery.isPending ? <Alert severity="info">Loading profile...</Alert> : null}
      {profileQuery.isError ? <Alert severity="error">Unable to load profile.</Alert> : null}

      {!profileQuery.isPending && !profileQuery.isError && currentProfile ? (
        <Card component="form" onSubmit={handleSubmit}>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                label="Display name"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                autoComplete="name"
                required
                fullWidth
              />
              <TextField
                label="Email address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                fullWidth
              />
              <Typography color="text.secondary" variant="body2">
                Role: {currentProfile.is_admin ? "Administrator" : "Member"} | Status:{" "}
                {currentProfile.is_active ? "Active" : "Inactive"}
              </Typography>
              <Button type="submit" variant="contained" disabled={!isDirty || isSubmitting}>
                Save changes
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}
