from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.member import HouseholdMember
from app.schemas.profile import ProfileResponse, ProfileUpdateRequest
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    member = ProfileService(db).get_profile(current_user.id)
    return ProfileResponse.model_validate(member)


@router.patch("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    member = ProfileService(db).update_profile(actor=current_user, payload=payload)
    return ProfileResponse.model_validate(member)
