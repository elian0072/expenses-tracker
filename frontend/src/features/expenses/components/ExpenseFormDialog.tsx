import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";

import type { Expense, ExpenseStatus } from "@/types/domain";

export type ExpenseFormPayload = {
  title: string;
  amount: string;
  status: ExpenseStatus;
  notes?: string | null;
};

export function ExpenseFormDialog({
  expense,
  onSave,
  onCancel
}: {
  expense?: Expense;
  onSave: (payload: ExpenseFormPayload & { version?: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense?.amount ?? "");
  const [status, setStatus] = useState<ExpenseStatus>(expense?.status ?? "planned");
  const [notes, setNotes] = useState(expense?.notes ?? "");
  const [saving, setSaving] = useState(false);

  const heading = useMemo(() => (expense ? "Edit expense" : "New expense"), [expense]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave({ title, amount, status, notes, version: expense?.version });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onClose={onCancel} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit}>
        <DialogTitle>{heading}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              id="expense-title"
              label="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              autoComplete="off"
            />
            <TextField
              id="expense-amount"
              label="Amount"
              type="number"
              inputProps={{ min: "0.01", step: "0.01" }}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              helperText="All amounts are stored in EUR."
              required
            />
            <FormControl>
              <InputLabel id="expense-status-label">Status</InputLabel>
              <Select
                labelId="expense-status-label"
                id="expense-status"
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as ExpenseStatus)}
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="purchased">Purchased</MenuItem>
                <MenuItem value="canceled">Canceled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              id="expense-notes"
              label="Notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button type="button" variant="text" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
