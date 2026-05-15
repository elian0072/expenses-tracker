import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RecurrenceRule(enum.StrEnum):
    none = "none"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"


class CalendarEvent(Base):
    __tablename__ = "calendar_events"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    all_day: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    recurrence_rule: Mapped[RecurrenceRule] = mapped_column(
        Enum(RecurrenceRule), default=RecurrenceRule.none
    )
    recurrence_end: Mapped[date | None] = mapped_column(Date, nullable=True)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("household_members.id", ondelete="RESTRICT"), index=True
    )
    updated_by_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("household_members.id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    created_by = relationship("HouseholdMember", foreign_keys=[created_by_id], lazy="raise")
