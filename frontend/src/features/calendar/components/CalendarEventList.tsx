import { Button, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";

import type { CalendarEventOccurrence } from "@/types/domain";

function formatDateTime(iso: string, allDay: boolean): string {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  if (allDay) return dateStr;
  const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${dateStr} ${timeStr}`;
}

export function CalendarEventList({
  events,
  onEventClick,
  onDelete
}: {
  events: CalendarEventOccurrence[];
  onEventClick: (event: CalendarEventOccurrence) => void;
  onDelete: (event: CalendarEventOccurrence) => void;
}) {
  if (events.length === 0) {
    return (
      <Typography color="text.secondary">No events in this period.</Typography>
    );
  }

  return (
    <Table size="small" aria-label="Calendar events">
      <TableHead>
        <TableRow>
          <TableCell>Title</TableCell>
          <TableCell>Start</TableCell>
          <TableCell>End</TableCell>
          <TableCell>Created by</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {events.map((event, idx) => (
          <TableRow key={`${event.event_id}-${idx}`} hover>
            <TableCell>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <span>{event.title}</span>
                {event.is_recurring ? (
                  <Typography variant="caption" color="text.secondary">
                    ↻
                  </Typography>
                ) : null}
              </Stack>
            </TableCell>
            <TableCell>{formatDateTime(event.starts_at, event.all_day)}</TableCell>
            <TableCell>{formatDateTime(event.ends_at, event.all_day)}</TableCell>
            <TableCell>{event.created_by.display_name}</TableCell>
            <TableCell align="right">
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button size="small" variant="outlined" onClick={() => onEventClick(event)}>
                  Edit
                </Button>
                <Button size="small" variant="contained" color="error" onClick={() => onDelete(event)}>
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
