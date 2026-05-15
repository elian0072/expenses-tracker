import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import ViewListIcon from "@mui/icons-material/ViewList";
import { Button, IconButton, Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";

export type CalendarView = "grid" | "list";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function CalendarToolbar({
  year,
  month,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
  onAddEvent
}: {
  year: number;
  month: number;
  view: CalendarView;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  onAddEvent: () => void;
}) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
      <Stack direction="row" spacing={0.5} alignItems="center">
        <IconButton onClick={onPrev} aria-label="Previous month" size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Button variant="text" size="small" onClick={onToday}>
          Today
        </Button>
        <IconButton onClick={onNext} aria-label="Next month" size="small">
          <ChevronRightIcon />
        </IconButton>
      </Stack>
      <Typography variant="h6" sx={{ minWidth: 180, textAlign: "center" }}>
        {MONTH_NAMES[month]} {year}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ ml: "auto" }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, next) => {
            if (next) onViewChange(next);
          }}
          size="small"
          aria-label="Calendar view"
        >
          <ToggleButton value="grid" aria-label="Grid view">
            <CalendarViewMonthIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="List view">
            <ViewListIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAddEvent}>
          Add event
        </Button>
      </Stack>
    </Stack>
  );
}
