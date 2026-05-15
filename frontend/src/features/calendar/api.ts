import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  fetchCalendarEvents,
  updateCalendarEvent
} from "@/services/calendar-events";
import type { CalendarEventInput, CalendarEventUpdateInput } from "@/services/calendar-events";

export function useCalendarEventsQuery(start: string, end: string) {
  return useQuery({
    queryKey: ["calendar-events", start, end],
    queryFn: () => fetchCalendarEvents(start, end),
    staleTime: 2 * 60_000,
    placeholderData: (previousData) => previousData
  });
}

export function useCreateCalendarEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CalendarEventInput) => createCalendarEvent(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    }
  });
}

export function useUpdateCalendarEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, payload }: { eventId: string; payload: CalendarEventUpdateInput }) =>
      updateCalendarEvent(eventId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    }
  });
}

export function useDeleteCalendarEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: string) => deleteCalendarEvent(eventId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
    }
  });
}
