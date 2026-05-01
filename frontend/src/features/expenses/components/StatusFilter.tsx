import { ToggleButton, ToggleButtonGroup } from "@mui/material";

import type { ExpenseStatus } from "@/types/domain";

export function StatusFilter({
  value,
  onChange
}: {
  value: ExpenseStatus | "all";
  onChange: (status: ExpenseStatus | "all") => void;
}) {
  return (
    <ToggleButtonGroup
      value={value}
      exclusive
      onChange={(_, next) => {
        if (next) onChange(next);
      }}
      aria-label="Filter expenses by status"
      size="small"
    >
      <ToggleButton value="all">All</ToggleButton>
      <ToggleButton value="planned">Planned</ToggleButton>
      <ToggleButton value="purchased">Purchased</ToggleButton>
      <ToggleButton value="canceled">Canceled</ToggleButton>
    </ToggleButtonGroup>
  );
}
