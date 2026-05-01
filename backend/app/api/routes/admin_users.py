from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_admin
from app.db.session import get_db
from app.models.member import HouseholdMember
from app.schemas.admin_user import (
    AdminUserListResponse,
    UserCreateRequest,
    UserSummary,
    UserUpdateRequest,
)
from app.services.admin_user_service import AdminUserService

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


@router.get("", response_model=AdminUserListResponse)
def list_users(
    q: str | None = Query(default=None, max_length=120),
    is_admin: bool | None = Query(default=None),
    _: HouseholdMember = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> AdminUserListResponse:
    users = AdminUserService(db).list_users(q=q, is_admin=is_admin)
    return AdminUserListResponse(items=[UserSummary.model_validate(user) for user in users])


@router.post("", response_model=UserSummary, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreateRequest,
    current_admin: HouseholdMember = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> UserSummary:
    user = AdminUserService(db).create_user(actor=current_admin, payload=payload)
    return UserSummary.model_validate(user)


@router.patch("/{userId}", response_model=UserSummary)
def update_user(
    userId: UUID,
    payload: UserUpdateRequest,
    current_admin: HouseholdMember = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> UserSummary:
    user = AdminUserService(db).update_user(actor=current_admin, user_id=userId, payload=payload)
    return UserSummary.model_validate(user)


@router.delete("/{userId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    userId: UUID,
    current_admin: HouseholdMember = Depends(get_current_admin),
    db: Session = Depends(get_db),
) -> Response:
    AdminUserService(db).delete_user(actor=current_admin, user_id=userId)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

