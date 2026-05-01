from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.activity import ActivityAction, ActivitySubjectType
from app.models.member import HouseholdMember
from app.schemas.profile import ProfileUpdateRequest
from app.services.activity_service import ActivityService


class ProfileService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.activity_service = ActivityService(db)

    def get_profile(self, member_id: UUID) -> HouseholdMember:
        member = self.db.get(HouseholdMember, member_id)
        if member is None:
            raise AppError(status_code=404, message="User not found", code="user_not_found")
        return member

    def update_profile(self, actor: HouseholdMember, payload: ProfileUpdateRequest) -> HouseholdMember:
        member = self.get_profile(actor.id)
        changed_fields: list[str] = []

        if payload.email is not None:
            normalized_email = payload.email.strip().lower()
            if not normalized_email:
                raise AppError(status_code=400, message="email cannot be empty", code="invalid_email")
            if normalized_email != member.email:
                self._ensure_email_available(normalized_email, actor.id)
                member.email = normalized_email
                changed_fields.append("email")

        if payload.display_name is not None:
            display_name = payload.display_name.strip()
            if not display_name:
                raise AppError(status_code=400, message="display_name cannot be empty", code="invalid_display_name")
            if display_name != member.display_name:
                member.display_name = display_name
                changed_fields.append("display_name")

        if not changed_fields:
            return member

        self.db.add(member)
        self.db.flush()

        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.member_updated,
            summary=f"Updated profile for '{member.email}'",
            details={"member_id": str(member.id), "changed_fields": changed_fields},
            subject_type=ActivitySubjectType.member,
            subject_id=member.id,
        )
        self.db.commit()
        self.db.refresh(member)
        return member

    def _ensure_email_available(self, email: str, excluded_member_id: UUID) -> None:
        existing = self.db.scalar(
            select(HouseholdMember).where(HouseholdMember.email == email, HouseholdMember.id != excluded_member_id)
        )
        if existing is not None:
            raise AppError(status_code=409, message="Email already exists", code="email_conflict")
