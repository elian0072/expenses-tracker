from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.member import HouseholdMember
from app.schemas.expense import YearSummaryResponse
from app.services.year_summary_service import YearSummaryService

router = APIRouter(tags=["summaries"])


@router.get("/api/years/{year}/summary", response_model=YearSummaryResponse)
def get_year_summary(
    year: int,
    _: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> YearSummaryResponse:
    summary = YearSummaryService(db).build_summary(year=year)
    return YearSummaryResponse(
        year=summary.year,
        planned_total=summary.planned_total,
        purchased_total=summary.purchased_total,
        canceled_count=summary.canceled_count,
        expense_count=summary.expense_count,
    )

