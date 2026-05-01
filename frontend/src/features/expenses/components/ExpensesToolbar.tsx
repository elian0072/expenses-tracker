import AddIcon from "@mui/icons-material/Add";
import { Button, Stack, TextField } from "@mui/material";

export function ExpensesToolbar({
  year,
  onYearChange,
  onAddExpense
}: {
  year: number;
  onYearChange: (year: number) => void;
  onAddExpense: () => void;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }}>
      <TextField
        label="Year"
        type="number"
        value={year}
        onChange={(event) => onYearChange(Number(event.target.value))}
        sx={{ maxWidth: 180 }}
      />
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAddExpense}>
        Add expense
      </Button>
    </Stack>
  );
}
