import { apiDelete, apiGet, apiPatch, apiPost } from "@/services/api-client";
import type { CalendarEvent, CalendarEventOccurrence, RecurrenceRule } from "@/types/domain";

export type CalendarEventInput = {
  title: string;
  starts_at: string;
  ends_at: string;
  all_day?: boolean;
  notes?: string | null;
  recurrence_rule?: RecurrenceRule;
  recurrence_end?: string | null;
};

export type CalendarEventUpdateInput = Partial<CalendarEventInput> & { version: number };

export async function fetchCalendarEvents(
  start: string,
  end: string
): Promise<CalendarEventOccurrence[]> {
  const params = new URLSearchParams({ start, end });
  const result = await apiGet<{ items: CalendarEventOccurrence[] }>(
    `/api/calendar/events?${params.toString()}`
  );
  return result.items;
}

export async function createCalendarEvent(payload: CalendarEventInput): Promise<CalendarEvent> {
  return apiPost<CalendarEvent>("/api/calendar/events", payload);
}

export async function updateCalendarEvent(
  eventId: string,
  payload: CalendarEventUpdateInput
): Promise<CalendarEvent> {
  return apiPatch<CalendarEvent>(`/api/calendar/events/${eventId}`, payload);
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  await apiDelete(`/api/calendar/events/${eventId}`);
}
