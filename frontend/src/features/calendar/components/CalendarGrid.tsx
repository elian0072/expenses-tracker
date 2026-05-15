import { Box, Paper, Typography, useTheme } from "@mui/material";
import { useMemo } from "react";

import type { CalendarEventOccurrence } from "@/types/domain";

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  year,
  month,
  events,
  onEventClick
}: {
  year: number;
  month: number;
  events: CalendarEventOccurrence[];
  onEventClick: (event: CalendarEventOccurrence) => void;
}) {
  const theme = useTheme();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEventOccurrence[]>();
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);
    const daysCount = monthEnd.getDate();

    for (const event of events) {
      const evtStart = new Date(event.starts_at);
      const evtEnd = new Date(event.ends_at);
      // Determine the range of days this event spans within the current month
      const firstDay = evtStart.getFullYear() === year && evtStart.getMonth() === month
        ? evtStart.getDate()
        : (evtStart < monthStart ? 1 : null);
      const lastDay = evtEnd.getFullYear() === year && evtEnd.getMonth() === month
        ? evtEnd.getDate()
        : (evtEnd > monthEnd ? daysCount : null);

      if (firstDay === null || lastDay === null) continue;

      for (let d = firstDay; d <= lastDay; d++) {
        if (!map.has(d)) map.set(d, []);
        map.get(d)!.push(event);
      }
    }
    return map;
  }, [events, year, month]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  const cells: Array<{ day: number | null; isToday: boolean }> = [];
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push({ day: null, isToday: false });
    } else {
      cells.push({ day: dayNum, isToday: isCurrentMonth && dayNum === todayDate });
    }
  }

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: "1px solid",
          borderColor: "divider"
        }}
      >
        {WEEKDAYS.map((wd) => (
          <Typography
            key={wd}
            variant="caption"
            fontWeight={600}
            sx={{ textAlign: "center", py: 0.75, color: "text.secondary" }}
          >
            {wd}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridAutoRows: "minmax(90px, 1fr)"
        }}
      >
        {cells.map((cell, idx) => {
          const dayEvents = cell.day ? eventsByDay.get(cell.day) ?? [] : [];
          return (
            <Box
              key={idx}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                p: 0.5,
                bgcolor: cell.day ? "background.paper" : "action.hover",
                position: "relative"
              }}
            >
              {cell.day ? (
                <>
                  <Typography
                    variant="caption"
                    fontWeight={cell.isToday ? 700 : 400}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      ...(cell.isToday && {
                        bgcolor: "primary.main",
                        color: "primary.contrastText"
                      })
                    }}
                  >
                    {cell.day}
                  </Typography>
                  <Box sx={{ mt: 0.25, display: "flex", flexDirection: "column", gap: 0.25 }}>
                    {dayEvents.slice(0, 3).map((evt, evtIdx) => (
                      <Paper
                        key={`${evt.event_id}-${evtIdx}`}
                        elevation={0}
                        onClick={() => onEventClick(evt)}
                        sx={{
                          px: 0.5,
                          py: 0.25,
                          fontSize: "0.7rem",
                          lineHeight: 1.2,
                          bgcolor: theme.palette.primary.main + "1A",
                          color: "primary.dark",
                          borderLeft: `3px solid ${theme.palette.primary.main}`,
                          cursor: "pointer",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          "&:hover": { bgcolor: theme.palette.primary.main + "33" }
                        }}
                      >
                        {evt.all_day ? evt.title : `${formatTime(evt.starts_at)} ${evt.title}`}
                      </Paper>
                    ))}
                    {dayEvents.length > 3 ? (
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", pl: 0.5 }}>
                        +{dayEvents.length - 3} more
                      </Typography>
                    ) : null}
                  </Box>
                </>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
