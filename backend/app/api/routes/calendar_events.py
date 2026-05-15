from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.member import HouseholdMember
from app.schemas.calendar_event import (
    CalendarEventCreateRequest,
    CalendarEventListResponse,
    CalendarEventResponse,
    CalendarEventUpdateRequest,
)
from app.services.calendar_event_service import CalendarEventService

router = APIRouter(tags=["calendar"])


@router.get("/api/calendar/events", response_model=CalendarEventListResponse)
def list_calendar_events(
    start: datetime = Query(..., description="Range start (ISO 8601)"),
    end: datetime = Query(..., description="Range end (ISO 8601)"),
    _: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CalendarEventListResponse:
    occurrences = CalendarEventService(db).list_events(range_start=start, range_end=end)
    return CalendarEventListResponse(items=occurrences)


@router.post("/api/calendar/events", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
def create_calendar_event(
    payload: CalendarEventCreateRequest,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CalendarEventResponse:
    event = CalendarEventService(db).create_event(actor=current_user, payload=payload)
    return CalendarEventResponse.model_validate(event)


@router.patch("/api/calendar/events/{eventId}", response_model=CalendarEventResponse)
def update_calendar_event(
    eventId: UUID,
    payload: CalendarEventUpdateRequest,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CalendarEventResponse:
    event = CalendarEventService(db).update_event(actor=current_user, event_id=eventId, payload=payload)
    return CalendarEventResponse.model_validate(event)


@router.delete("/api/calendar/events/{eventId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_calendar_event(
    eventId: UUID,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    CalendarEventService(db).delete_event(actor=current_user, event_id=eventId)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
