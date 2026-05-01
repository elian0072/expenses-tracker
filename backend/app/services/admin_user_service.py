from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import hash_password
from app.models.activity import ActivityAction, ActivitySubjectType
from app.models.member import HouseholdMember
from app.schemas.admin_user import UserCreateRequest, UserUpdateRequest
from app.services.activity_service import ActivityService


class AdminUserService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.activity_service = ActivityService(db)

    def list_users(self, q: str | None = None, is_admin: bool | None = None) -> list[HouseholdMember]:
        query = select(HouseholdMember).order_by(HouseholdMember.created_at.desc())
        if q:
            term = f"%{q.strip()}%"
            query = query.where(
                or_(
                    HouseholdMember.email.ilike(term),
                    HouseholdMember.display_name.ilike(term),
                )
            )
        if is_admin is not None:
            query = query.where(HouseholdMember.is_admin == is_admin)
        return list(self.db.scalars(query))

    def create_user(self, actor: HouseholdMember, payload: UserCreateRequest) -> HouseholdMember:
        email = payload.email.strip().lower()
        self._ensure_email_available(email=email)
        display_name = payload.display_name.strip()
        if not display_name:
            raise AppError(status_code=400, message="display_name cannot be empty", code="invalid_display_name")

        member = HouseholdMember(
            email=email,
            display_name=display_name,
            password_hash=hash_password(payload.password),
            is_active=payload.is_active,
            is_admin=payload.is_admin,
        )
        self.db.add(member)
        self.db.flush()

        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.member_created,
            summary=f"Created user '{member.email}'",
            details={"member_id": str(member.id), "is_admin": member.is_admin, "is_active": member.is_active},
            subject_type=ActivitySubjectType.member,
            subject_id=member.id,
        )
        self.db.commit()
        self.db.refresh(member)
        return member

    def update_user(self, actor: HouseholdMember, user_id: UUID, payload: UserUpdateRequest) -> HouseholdMember:
        member = self.db.get(HouseholdMember, user_id)
        if not member:
            raise AppError(status_code=404, message="User not found", code="user_not_found")

        before_admin = member.is_admin
        before_active = member.is_active

        if payload.email is not None:
            email = payload.email.strip().lower()
            if not email:
                raise AppError(status_code=400, message="email cannot be empty", code="invalid_email")
            if email != member.email:
                self._ensure_email_available(email=email)
                member.email = email

        if payload.display_name is not None:
            display_name = payload.display_name.strip()
            if not display_name:
                raise AppError(status_code=400, message="display_name cannot be empty", code="invalid_display_name")
            member.display_name = display_name

        if payload.password is not None:
            member.password_hash = hash_password(payload.password)

        if payload.is_admin is not None:
            member.is_admin = payload.is_admin
        if payload.is_active is not None:
            member.is_active = payload.is_active

        self.db.add(member)
        self.db.flush()

        if before_admin and before_active and not (member.is_admin and member.is_active):
            self._raise_if_no_active_admin_after_change()

        action_type = (
            ActivityAction.member_role_changed
            if before_admin != member.is_admin
            else ActivityAction.member_updated
        )

        self.activity_service.record(
            actor=actor,
            action_type=action_type,
            summary=f"Updated user '{member.email}'",
            details={"member_id": str(member.id), "is_admin": member.is_admin, "is_active": member.is_active},
            subject_type=ActivitySubjectType.member,
            subject_id=member.id,
        )

        self.db.commit()
        self.db.refresh(member)
        return member

    def delete_user(self, actor: HouseholdMember, user_id: UUID) -> None:
        member = self.db.get(HouseholdMember, user_id)
        if not member:
            raise AppError(status_code=404, message="User not found", code="user_not_found")
        if member.is_admin and member.is_active:
            active_admin_count = self._count_active_admins()
            if active_admin_count <= 1:
                raise AppError(
                    status_code=409,
                    message="Cannot delete the last active admin",
                    code="last_admin_guard",
                )

        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.member_deleted,
            summary=f"Deleted user '{member.email}'",
            details={"member_id": str(member.id)},
            subject_type=ActivitySubjectType.member,
            subject_id=member.id,
        )
        self.db.delete(member)
        self.db.commit()

    def _ensure_email_available(self, email: str) -> None:
        existing = self.db.scalar(select(HouseholdMember).where(HouseholdMember.email == email))
        if existing is not None:
            raise AppError(status_code=409, message="Email already exists", code="email_conflict")

    def _count_active_admins(self) -> int:
        return int(
            self.db.scalar(
                select(func.count(HouseholdMember.id)).where(
                    HouseholdMember.is_admin.is_(True),
                    HouseholdMember.is_active.is_(True),
                )
            )
            or 0
        )

    def _raise_if_no_active_admin_after_change(self) -> None:
        if self._count_active_admins() == 0:
            raise AppError(
                status_code=409,
                message="At least one active admin must remain",
                code="last_admin_guard",
            )
