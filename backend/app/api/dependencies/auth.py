from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError
from app.db.session import get_db
from app.models.member import HouseholdMember
from app.services.auth_service import AuthService


def get_current_user(request: Request, db: Session = Depends(get_db)) -> HouseholdMember:
    settings = get_settings()
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        raise AppError(status_code=401, message="Not authenticated", code="not_authenticated")

    member = AuthService(db).get_member_by_session_token(session_token)
    if not member:
        raise AppError(status_code=401, message="Not authenticated", code="invalid_session")
    return member


def get_current_admin(current_user: HouseholdMember = Depends(get_current_user)) -> HouseholdMember:
    if not current_user.is_admin:
        raise AppError(status_code=403, message="Admin role required", code="admin_required")
    return current_user
