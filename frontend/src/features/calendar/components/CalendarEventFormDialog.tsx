import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField
} from "@mui/material";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import type { CalendarEvent, RecurrenceRule } from "@/types/domain";

export type CalendarEventFormPayload = {
  title: string;
  starts_at: string;
  ends_at: string;
  all_day: boolean;
  notes?: string | null;
  recurrence_rule: RecurrenceRule;
  recurrence_end?: string | null;
};

/* ── helpers ── */

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function buildDateOptions(baseYear: number, baseMonth: number): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const start = new Date(baseYear, baseMonth - 1, 1);
  const end = new Date(baseYear, baseMonth + 2, 0);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const val = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const label = d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
    options.push({ value: val, label });
  }
  return options;
}

function buildTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const val = `${pad(h)}:${pad(m)}`;
      options.push({ value: val, label: val });
    }
  }
  return options;
}

const TIME_OPTIONS = buildTimeOptions();

function roundTo15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeStr(d: Date): string {
  const m = roundTo15(d.getMinutes());
  const h = m === 60 ? d.getHours() + 1 : d.getHours();
  return `${pad(h % 24)}:${pad(m % 60)}`;
}

function combineDatetime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

function addHour(dateStr: string, timeStr: string): { date: string; time: string } {
  const d = combineDatetime(dateStr, timeStr);
  d.setHours(d.getHours() + 1);
  return { date: toDateStr(d), time: toTimeStr(d) };
}

export function CalendarEventFormDialog({
  event,
  defaultStart,
  onSave,
  onCancel
}: {
  event?: CalendarEvent;
  defaultStart?: string;
  onSave: (payload: CalendarEventFormPayload & { version?: number }) => Promise<void>;
  onCancel: () => void;
}) {
  const now = new Date();
  const initDate = event ? new Date(event.starts_at) : defaultStart ? new Date(defaultStart) : now;
  const initEndDate = event ? new Date(event.ends_at) : null;

  const [title, setTitle] = useState(event?.title ?? "");
  const [startDate, setStartDate] = useState(toDateStr(initDate));
  const [startTime, setStartTime] = useState(toTimeStr(initDate));
  const [endDate, setEndDate] = useState(initEndDate ? toDateStr(initEndDate) : addHour(toDateStr(initDate), toTimeStr(initDate)).date);
  const [endTime, setEndTime] = useState(initEndDate ? toTimeStr(initEndDate) : addHour(toDateStr(initDate), toTimeStr(initDate)).time);
  const [allDay, setAllDay] = useState(event?.all_day ?? false);
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(event?.recurrence_rule ?? "none");
  const [recurrenceEnd, setRecurrenceEnd] = useState(event?.recurrence_end?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);

  const heading = event ? "Edit event" : "New event";

  const dateOptions = buildDateOptions(initDate.getFullYear(), initDate.getMonth() + 1);
  const recurrenceDateOptions = buildDateOptions(initDate.getFullYear(), initDate.getMonth() + 1);

  // Auto-set end = start + 1h when start changes (only for new events)
  useEffect(() => {
    if (!event) {
      const { date, time } = addHour(startDate, startTime);
      setEndDate(date);
      setEndTime(time);
    }
  }, [startDate, startTime]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title,
        starts_at: combineDatetime(startDate, allDay ? "00:00" : startTime).toISOString(),
        ends_at: combineDatetime(endDate, allDay ? "23:59" : endTime).toISOString(),
        all_day: allDay,
        notes: notes || null,
        recurrence_rule: recurrenceRule,
        recurrence_end: recurrenceRule !== "none" && recurrenceEnd ? recurrenceEnd : null,
        version: event?.version
      });
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
              id="event-title"
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoComplete="off"
            />
            <FormControlLabel
              control={
                <Checkbox checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
              }
              label="All day"
            />
            <FormControl required>
              <InputLabel id="start-date-label">Start date</InputLabel>
              <Select
                labelId="start-date-label"
                id="event-start-date"
                label="Start date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              >
                {dateOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!allDay ? (
              <FormControl required>
                <InputLabel id="start-time-label">Start time</InputLabel>
                <Select
                  labelId="start-time-label"
                  id="event-start-time"
                  label="Start time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                >
                  {TIME_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            <FormControl required>
              <InputLabel id="end-date-label">End date</InputLabel>
              <Select
                labelId="end-date-label"
                id="event-end-date"
                label="End date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              >
                {dateOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            {!allDay ? (
              <FormControl required>
                <InputLabel id="end-time-label">End time</InputLabel>
                <Select
                  labelId="end-time-label"
                  id="event-end-time"
                  label="End time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                >
                  {TIME_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            <FormControl>
              <InputLabel id="event-recurrence-label">Recurrence</InputLabel>
              <Select
                labelId="event-recurrence-label"
                id="event-recurrence"
                label="Recurrence"
                value={recurrenceRule}
                onChange={(e) => setRecurrenceRule(e.target.value as RecurrenceRule)}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
            {recurrenceRule !== "none" ? (
              <FormControl required>
                <InputLabel id="recurrence-end-label">Recurrence end date</InputLabel>
                <Select
                  labelId="recurrence-end-label"
                  id="event-recurrence-end"
                  label="Recurrence end date"
                  value={recurrenceEnd}
                  onChange={(e) => setRecurrenceEnd(e.target.value)}
                >
                  {recurrenceDateOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : null}
            <TextField
              id="event-notes"
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
