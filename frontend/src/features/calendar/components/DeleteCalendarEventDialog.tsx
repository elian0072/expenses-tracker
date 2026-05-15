import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export function DeleteCalendarEventDialog({
  title,
  onConfirm,
  onCancel
}: {
  title: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <Dialog open onClose={onCancel}>
      <DialogTitle>Delete event</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete &quot;{title}&quot;?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" variant="contained" onClick={() => void onConfirm()}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
