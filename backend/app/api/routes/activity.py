from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_admin
from app.db.session import get_db
from app.models.activity import ActivityRecord
from app.models.member import HouseholdMember
from app.schemas.activity import ActivityActor, ActivityListResponse, ActivityRecordResponse
from app.services.activity_service import ActivityService

router = APIRouter(tags=["activity"])


def to_response(item: ActivityRecord, actor: HouseholdMember | None) -> ActivityRecordResponse:
    fallback_actor = ActivityActor(id=item.actor_id, display_name="Unknown")
    mapped_actor = ActivityActor(id=actor.id, display_name=actor.display_name) if actor else fallback_actor
    return ActivityRecordResponse(
        id=item.id,
        actor=mapped_actor,
        subject_type=item.subject_type,
        subject_id=item.subject_id,
        expense_id=item.expense_id,
        planning_year=item.planning_year,
        action_type=item.action_type,
        summary=item.summary,
        details=item.details,
        created_at=item.created_at,
    )


@router.get("/api/activity", response_model=ActivityListResponse)
def get_activity(
    year: int | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    _: HouseholdMember = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> ActivityListResponse:
    service = ActivityService(db)
    items = service.list_activity(year=year, limit=limit)
    actors = {member.id: member for member in db.query(HouseholdMember).all()}
    return ActivityListResponse(items=[to_response(item=item, actor=actors.get(item.actor_id)) for item in items])
