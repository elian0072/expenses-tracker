import enum
import uuid
from datetime import datetime

from sqlalchemy import JSON, DateTime, Enum, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ActivityAction(enum.StrEnum):
    created = "created"
    updated = "updated"
    deleted = "deleted"
    status_changed = "status_changed"
    member_created = "member_created"
    member_updated = "member_updated"
    member_deleted = "member_deleted"
    member_role_changed = "member_role_changed"


class ActivitySubjectType(enum.StrEnum):
    expense = "expense"
    member = "member"


class ActivityRecord(Base):
    __tablename__ = "activity_records"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    actor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("household_members.id", ondelete="RESTRICT"))
    expense_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("expense_entries.id", ondelete="SET NULL"), nullable=True
    )
    subject_type: Mapped[ActivitySubjectType | None] = mapped_column(
        Enum(ActivitySubjectType), nullable=True, index=True
    )
    subject_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True, index=True)
    planning_year: Mapped[int | None] = mapped_column(Integer, index=True, nullable=True)
    action_type: Mapped[ActivityAction] = mapped_column(Enum(ActivityAction), index=True)
    summary: Mapped[str] = mapped_column(String(255))
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
