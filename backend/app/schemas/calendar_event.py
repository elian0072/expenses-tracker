from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator

from app.models.calendar_event import RecurrenceRule


class CalendarEventCreator(BaseModel):
    id: UUID
    display_name: str

    class Config:
        from_attributes = True


class CalendarEventCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    ends_at: datetime
    all_day: bool = False
    notes: str | None = None
    recurrence_rule: RecurrenceRule = RecurrenceRule.none
    recurrence_end: date | None = None

    @model_validator(mode="after")
    def validate_times(self) -> "CalendarEventCreateRequest":
        if self.ends_at <= self.starts_at:
            raise ValueError("ends_at must be after starts_at")
        if self.recurrence_rule != RecurrenceRule.none:
            if self.recurrence_end is None:
                raise ValueError("recurrence_end is required for recurring events")
            if self.recurrence_end < self.starts_at.date():
                raise ValueError("recurrence_end must be on or after starts_at date")
            max_end = date(self.starts_at.year + 1, self.starts_at.month, self.starts_at.day)
            if self.recurrence_end > max_end:
                raise ValueError("recurrence_end must be within 1 year of starts_at")
        return self


class CalendarEventUpdateRequest(BaseModel):
    version: int = Field(ge=1)
    title: str | None = Field(default=None, min_length=1, max_length=200)
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    all_day: bool | None = None
    notes: str | None = None
    recurrence_rule: RecurrenceRule | None = None
    recurrence_end: date | None = None


class CalendarEventResponse(BaseModel):
    id: UUID
    title: str
    starts_at: datetime
    ends_at: datetime
    all_day: bool
    notes: str | None
    recurrence_rule: RecurrenceRule
    recurrence_end: date | None
    version: int
    created_by: CalendarEventCreator
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CalendarEventOccurrence(BaseModel):
    """A single occurrence of a (potentially recurring) event."""

    event_id: UUID
    title: str
    starts_at: datetime
    ends_at: datetime
    all_day: bool
    notes: str | None
    recurrence_rule: RecurrenceRule
    is_recurring: bool
    created_by: CalendarEventCreator
    version: int


class CalendarEventListResponse(BaseModel):
    items: list[CalendarEventOccurrence]
