from datetime import datetime, timedelta
from uuid import UUID

from dateutil.relativedelta import relativedelta
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.errors import AppError
from app.models.activity import ActivityAction, ActivitySubjectType
from app.models.calendar_event import CalendarEvent, RecurrenceRule
from app.models.member import HouseholdMember
from app.schemas.calendar_event import (
    CalendarEventCreateRequest,
    CalendarEventCreator,
    CalendarEventOccurrence,
    CalendarEventUpdateRequest,
)
from app.services.activity_service import ActivityService


class CalendarEventService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.activity_service = ActivityService(db)

    def list_events(self, range_start: datetime, range_end: datetime) -> list[CalendarEventOccurrence]:
        query = (
            select(CalendarEvent)
            .options(joinedload(CalendarEvent.created_by))
            .where(CalendarEvent.starts_at < range_end)
            .order_by(CalendarEvent.starts_at)
        )
        events = list(self.db.scalars(query))
        occurrences: list[CalendarEventOccurrence] = []
        for event in events:
            occurrences.extend(self._expand_occurrences(event, range_start, range_end))
        occurrences.sort(key=lambda o: o.starts_at)
        return occurrences

    def get_event(self, event_id: UUID) -> CalendarEvent:
        query = (
            select(CalendarEvent)
            .options(joinedload(CalendarEvent.created_by))
            .where(CalendarEvent.id == event_id)
        )
        event = self.db.scalars(query).first()
        if not event:
            raise AppError(status_code=404, message="Calendar event not found", code="event_not_found")
        return event

    def create_event(self, actor: HouseholdMember, payload: CalendarEventCreateRequest) -> CalendarEvent:
        event = CalendarEvent(
            title=payload.title,
            starts_at=payload.starts_at,
            ends_at=payload.ends_at,
            all_day=payload.all_day,
            notes=payload.notes,
            recurrence_rule=payload.recurrence_rule,
            recurrence_end=payload.recurrence_end,
            created_by_id=actor.id,
            updated_by_id=actor.id,
        )
        self.db.add(event)
        self.db.flush()
        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.created,
            summary=f"Created calendar event '{event.title}'",
            details={"starts_at": event.starts_at.isoformat(), "recurrence": event.recurrence_rule.value},
            subject_type=ActivitySubjectType.calendar_event,
            subject_id=event.id,
        )
        self.db.commit()
        return self.get_event(event.id)

    def update_event(
        self, actor: HouseholdMember, event_id: UUID, payload: CalendarEventUpdateRequest
    ) -> CalendarEvent:
        event = self.get_event(event_id)
        if event.version != payload.version:
            raise AppError(status_code=409, message="Stale event version", code="stale_version")

        if payload.title is not None:
            event.title = payload.title
        if payload.starts_at is not None:
            event.starts_at = payload.starts_at
        if payload.ends_at is not None:
            event.ends_at = payload.ends_at
        if payload.all_day is not None:
            event.all_day = payload.all_day
        if payload.notes is not None:
            event.notes = payload.notes
        if payload.recurrence_rule is not None:
            event.recurrence_rule = payload.recurrence_rule
        if payload.recurrence_end is not None:
            event.recurrence_end = payload.recurrence_end

        if event.ends_at <= event.starts_at:
            raise AppError(status_code=400, message="ends_at must be after starts_at", code="invalid_times")

        event.updated_by_id = actor.id
        event.version += 1
        self.db.add(event)
        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.updated,
            summary=f"Updated calendar event '{event.title}'",
            details={"starts_at": event.starts_at.isoformat(), "recurrence": event.recurrence_rule.value},
            subject_type=ActivitySubjectType.calendar_event,
            subject_id=event.id,
        )
        self.db.commit()
        return self.get_event(event.id)

    def delete_event(self, actor: HouseholdMember, event_id: UUID) -> None:
        event = self.get_event(event_id)
        title = event.title
        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.deleted,
            summary=f"Deleted calendar event '{title}'",
            details={"starts_at": event.starts_at.isoformat()},
            subject_type=ActivitySubjectType.calendar_event,
            subject_id=event.id,
        )
        self.db.delete(event)
        self.db.commit()

    @staticmethod
    def _expand_occurrences(
        event: CalendarEvent, range_start: datetime, range_end: datetime
    ) -> list[CalendarEventOccurrence]:
        creator = CalendarEventCreator.model_validate(event.created_by)
        duration = event.ends_at - event.starts_at

        if event.recurrence_rule == RecurrenceRule.none:
            if event.ends_at > range_start and event.starts_at < range_end:
                return [
                    CalendarEventOccurrence(
                        event_id=event.id,
                        title=event.title,
                        starts_at=event.starts_at,
                        ends_at=event.ends_at,
                        all_day=event.all_day,
                        notes=event.notes,
                        recurrence_rule=event.recurrence_rule,
                        is_recurring=False,
                        created_by=creator,
                        version=event.version,
                    )
                ]
            return []

        occurrences: list[CalendarEventOccurrence] = []
        current_start = event.starts_at
        recurrence_limit = (
            datetime.combine(event.recurrence_end, event.starts_at.timetz())
            if event.recurrence_end
            else range_end
        )
        limit = min(recurrence_limit, range_end)

        max_iterations = 366
        iterations = 0
        while current_start < limit and iterations < max_iterations:
            current_end = current_start + duration
            if current_end > range_start:
                occurrences.append(
                    CalendarEventOccurrence(
                        event_id=event.id,
                        title=event.title,
                        starts_at=current_start,
                        ends_at=current_end,
                        all_day=event.all_day,
                        notes=event.notes,
                        recurrence_rule=event.recurrence_rule,
                        is_recurring=True,
                        created_by=creator,
                        version=event.version,
                    )
                )
            current_start = _advance(current_start, event.recurrence_rule)
            iterations += 1
        return occurrences


def _advance(dt: datetime, rule: RecurrenceRule) -> datetime:
    if rule == RecurrenceRule.daily:
        return dt + timedelta(days=1)
    if rule == RecurrenceRule.weekly:
        return dt + timedelta(weeks=1)
    if rule == RecurrenceRule.monthly:
        return dt + relativedelta(months=1)
    return dt
