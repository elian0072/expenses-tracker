import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

import type { Expense } from "@/types/domain";
import { formatCurrencyEur, formatStatusLabel } from "@/utils/formatters";

export function ExpensesTable({
  expenses,
  onEdit,
  onDelete
}: {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}) {
  return (
    <Table size="small" aria-label="Expenses table">
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {expenses.map((expense) => (
          <TableRow key={expense.id} hover>
            <TableCell>{expense.title}</TableCell>
            <TableCell>{formatStatusLabel(expense.status)}</TableCell>
            <TableCell>{formatCurrencyEur(expense.amount)}</TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" variant="outlined" onClick={() => onEdit(expense)}>
                  Edit
                </Button>
                <Button size="small" variant="contained" color="error" onClick={() => onDelete(expense)}>
                  Delete
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
