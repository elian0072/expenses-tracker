import pytest

from app.core.errors import AppError
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.activity import ActivityAction, ActivityRecord, ActivitySubjectType
from app.models.member import HouseholdMember
from app.schemas.profile import ProfileUpdateRequest
from app.services.profile_service import ProfileService


def test_get_profile_returns_authenticated_member() -> None:
    with SessionLocal() as db:
        member = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        profile = ProfileService(db).get_profile(member.id)

        assert profile.id == member.id
        assert profile.email == "owner@example.com"


def test_update_profile_normalizes_values_and_records_activity() -> None:
    with SessionLocal() as db:
        member = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        service = ProfileService(db)

        updated = service.update_profile(
            actor=member,
            payload=ProfileUpdateRequest(email="  OWNER+NEW@EXAMPLE.COM  ", display_name="  Updated Owner  "),
        )

        assert updated.email == "owner+new@example.com"
        assert updated.display_name == "Updated Owner"

        latest_activity = db.query(ActivityRecord).order_by(ActivityRecord.created_at.desc()).first()
        assert latest_activity is not None
        assert latest_activity.action_type == ActivityAction.member_updated
        assert latest_activity.subject_type == ActivitySubjectType.member
        assert latest_activity.subject_id == member.id


def test_update_profile_rejects_conflicting_email() -> None:
    with SessionLocal() as db:
        owner = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        db.add(
            HouseholdMember(
                email="taken@example.com",
                display_name="Taken",
                password_hash=hash_password("member-password"),
                is_active=True,
                is_admin=False,
            )
        )
        db.commit()

        service = ProfileService(db)
        with pytest.raises(AppError) as exc:
            service.update_profile(actor=owner, payload=ProfileUpdateRequest(email="taken@example.com"))

        assert exc.value.status_code == 409
        assert exc.value.code == "email_conflict"
