from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.activity import ActivityAction, ActivitySubjectType


class ActivityActor(BaseModel):
    id: UUID
    display_name: str


class ActivityRecordResponse(BaseModel):
    id: UUID
    actor: ActivityActor
    subject_type: ActivitySubjectType | None
    subject_id: UUID | None
    expense_id: UUID | None
    planning_year: int | None
    action_type: ActivityAction
    summary: str
    details: dict
    created_at: datetime


class ActivityListResponse(BaseModel):
    items: list[ActivityRecordResponse]
