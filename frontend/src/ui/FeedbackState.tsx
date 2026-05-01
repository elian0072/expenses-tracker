import { Alert } from "@mui/material";

type FeedbackStateType = "idle" | "loading" | "success" | "error";

export function FeedbackState({
  state,
  message
}: {
  state: FeedbackStateType;
  message: string;
}) {
  if (state === "idle" || !message) return null;
  if (state === "loading") return <Alert severity="info">{message}</Alert>;
  if (state === "error") return <Alert severity="error">{message}</Alert>;
  return <Alert severity="success">{message}</Alert>;
}
