import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

export function DeleteExpenseDialog({
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
      <DialogTitle>Delete expense</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete "{title}"?</Typography>
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
