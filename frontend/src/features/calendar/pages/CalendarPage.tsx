import { Alert, Card, CardContent, Stack, Typography } from "@mui/material";
import { useMemo, useState } from "react";

import {
  useCalendarEventsQuery,
  useCreateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useUpdateCalendarEventMutation
} from "@/features/calendar/api";
import { useSessionQuery } from "@/features/auth/session";
import { CalendarEventFormDialog } from "@/features/calendar/components/CalendarEventFormDialog";
import type { CalendarEventFormPayload } from "@/features/calendar/components/CalendarEventFormDialog";
import { CalendarEventList } from "@/features/calendar/components/CalendarEventList";
import { CalendarGrid } from "@/features/calendar/components/CalendarGrid";
import { CalendarToolbar } from "@/features/calendar/components/CalendarToolbar";
import type { CalendarView } from "@/features/calendar/components/CalendarToolbar";
import { DeleteCalendarEventDialog } from "@/features/calendar/components/DeleteCalendarEventDialog";
import { EventDetailDialog } from "@/features/calendar/components/EventDetailDialog";
import { FeedbackState } from "@/ui/FeedbackState";
import type { CalendarEvent, CalendarEventOccurrence } from "@/types/domain";

export function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [view, setView] = useState<CalendarView>("grid");
  const [feedbackState, setFeedbackState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [viewing, setViewing] = useState<CalendarEventOccurrence | null>(null);
  const [deleting, setDeleting] = useState<CalendarEventOccurrence | null>(null);

  const sessionQuery = useSessionQuery();
  const currentUser = sessionQuery.data;

  const rangeStart = useMemo(() => new Date(year, month, 1).toISOString(), [year, month]);
  const rangeEnd = useMemo(() => new Date(year, month + 1, 1).toISOString(), [year, month]);

  const eventsQuery = useCalendarEventsQuery(rangeStart, rangeEnd);
  const createMutation = useCreateCalendarEventMutation();
  const updateMutation = useUpdateCalendarEventMutation();
  const deleteMutation = useDeleteCalendarEventMutation();

  const loading = eventsQuery.isPending;
  const hasError = eventsQuery.isError;
  const events = eventsQuery.data ?? [];

  function goToPrev() {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goToNext() {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  function goToToday() {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  function handleEventClick(occurrence: CalendarEventOccurrence) {
    setViewing(occurrence);
  }

  function handleViewToEdit() {
    if (!viewing) return;
    const evt: CalendarEvent = {
      id: viewing.event_id,
      title: viewing.title,
      starts_at: viewing.starts_at,
      ends_at: viewing.ends_at,
      all_day: viewing.all_day,
      notes: viewing.notes,
      recurrence_rule: viewing.recurrence_rule,
      recurrence_end: null,
      version: viewing.version,
      created_by: viewing.created_by,
      created_at: "",
      updated_at: ""
    };
    setViewing(null);
    setEditing(evt);
  }

  function handleViewToDelete() {
    if (!viewing) return;
    const occ = viewing;
    setViewing(null);
    setDeleting(occ);
  }

  async function handleSave(payload: CalendarEventFormPayload & { version?: number }) {
    setFeedbackState("loading");
    setFeedbackMessage("Saving event...");
    try {
      if (editing) {
        await updateMutation.mutateAsync({
          eventId: editing.id,
          payload: { ...payload, version: editing.version }
        });
        setFeedbackMessage("Event updated.");
      } else {
        await createMutation.mutateAsync(payload);
        setFeedbackMessage("Event created.");
      }
      setFeedbackState("success");
      setEditing(null);
      setShowCreate(false);
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Unable to save event.");
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setFeedbackState("loading");
    setFeedbackMessage("Deleting event...");
    try {
      await deleteMutation.mutateAsync(deleting.event_id);
      setFeedbackState("success");
      setFeedbackMessage("Event deleted.");
      setDeleting(null);
    } catch (error) {
      setFeedbackState("error");
      setFeedbackMessage(error instanceof Error ? error.message : "Unable to delete event.");
    }
  }

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Typography variant="h4">Calendar</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Plan and view household events.
          </Typography>
          <CalendarToolbar
            year={year}
            month={month}
            view={view}
            onPrev={goToPrev}
            onNext={goToNext}
            onToday={goToToday}
            onViewChange={setView}
            onAddEvent={() => setShowCreate(true)}
          />
        </CardContent>
      </Card>

      <FeedbackState state={feedbackState} message={feedbackMessage} />

      {loading ? <Alert severity="info">Loading calendar events...</Alert> : null}
      {hasError ? <Alert severity="error">Unable to load calendar events.</Alert> : null}

      {!loading && !hasError ? (
        <Card>
          <CardContent>
            {view === "grid" ? (
              <CalendarGrid
                year={year}
                month={month}
                events={events}
                onEventClick={handleEventClick}
              />
            ) : (
              <CalendarEventList
                events={events}
                onEventClick={handleEventClick}
                onDelete={setDeleting}
              />
            )}
          </CardContent>
        </Card>
      ) : null}

      {viewing && currentUser ? (
        <EventDetailDialog
          event={viewing}
          currentUser={currentUser}
          onEdit={handleViewToEdit}
          onDelete={handleViewToDelete}
          onClose={() => setViewing(null)}
        />
      ) : null}

      {showCreate || editing ? (
        <CalendarEventFormDialog
          event={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setEditing(null);
            setShowCreate(false);
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteCalendarEventDialog
          title={deleting.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      ) : null}
    </Stack>
  );
}
