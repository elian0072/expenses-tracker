from uuid import UUID

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.activity import ActivityAction, ActivityRecord, ActivitySubjectType
from app.models.member import HouseholdMember


class ActivityService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def record(
        self,
        actor: HouseholdMember,
        action_type: ActivityAction,
        summary: str,
        details: dict,
        planning_year: int | None = None,
        subject_type: ActivitySubjectType | None = None,
        subject_id: UUID | None = None,
        expense_id: UUID | None = None,
    ) -> ActivityRecord:
        resolved_subject_type = subject_type or ActivitySubjectType.expense
        resolved_subject_id = subject_id if subject_id is not None else expense_id
        activity = ActivityRecord(
            actor_id=actor.id,
            expense_id=expense_id,
            subject_type=resolved_subject_type,
            subject_id=resolved_subject_id,
            planning_year=planning_year,
            action_type=action_type,
            summary=summary,
            details=details,
        )
        self.db.add(activity)
        self.db.flush()
        return activity

    def list_activity(self, year: int | None = None, limit: int = 50) -> list[ActivityRecord]:
        query = select(ActivityRecord).order_by(desc(ActivityRecord.created_at)).limit(limit)
        if year is not None:
            query = query.where(ActivityRecord.planning_year == year)
        return list(self.db.scalars(query))
