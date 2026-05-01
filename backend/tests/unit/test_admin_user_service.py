import pytest

from app.core.errors import AppError
from app.db.session import SessionLocal
from app.models.activity import ActivityAction, ActivityRecord
from app.models.member import HouseholdMember
from app.schemas.admin_user import UserCreateRequest, UserUpdateRequest
from app.services.admin_user_service import AdminUserService


def test_create_user_and_record_activity() -> None:
    with SessionLocal() as db:
        admin = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        service = AdminUserService(db)
        created = service.create_user(
            actor=admin,
            payload=UserCreateRequest(
                email="new-user@example.com",
                password="password-123",
                display_name="New User",
                is_admin=False,
                is_active=True,
            ),
        )

        assert created.email == "new-user@example.com"
        assert created.is_admin is False

        latest_activity = (
            db.query(ActivityRecord).order_by(ActivityRecord.created_at.desc()).first()
        )
        assert latest_activity is not None
        assert latest_activity.action_type == ActivityAction.member_created
        assert latest_activity.subject_id == created.id


def test_last_active_admin_cannot_be_demoted() -> None:
    with SessionLocal() as db:
        admin = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        service = AdminUserService(db)

        with pytest.raises(AppError) as exc:
            service.update_user(actor=admin, user_id=admin.id, payload=UserUpdateRequest(is_admin=False))

        assert exc.value.status_code == 409
        assert exc.value.code == "last_admin_guard"


def test_last_active_admin_cannot_be_deleted() -> None:
    with SessionLocal() as db:
        admin = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        service = AdminUserService(db)

        with pytest.raises(AppError) as exc:
            service.delete_user(actor=admin, user_id=admin.id)

        assert exc.value.status_code == 409
        assert exc.value.code == "last_admin_guard"

