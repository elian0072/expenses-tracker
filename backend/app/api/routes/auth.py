from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.models.member import HouseholdMember
from app.schemas.auth import CurrentUser, LoginRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=CurrentUser)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> CurrentUser:
    settings = get_settings()
    member, session = AuthService(db).login(
        email=payload.email,
        password=payload.password,
        user_agent=request.headers.get("user-agent"),
    )
    response.set_cookie(
        key=settings.session_cookie_name,
        value=session.session_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=settings.session_days * 24 * 60 * 60,
    )
    return CurrentUser(
        id=member.id,
        email=member.email,
        display_name=member.display_name,
        is_admin=member.is_admin,
        is_active=member.is_active,
    )


@router.post("/logout", status_code=204)
def logout(request: Request, db: Session = Depends(get_db)) -> Response:
    settings = get_settings()
    session_token = request.cookies.get(settings.session_cookie_name)
    AuthService(db).logout(session_token)
    response = Response(status_code=204)
    response.delete_cookie(settings.session_cookie_name)
    return response


@router.get("/me", response_model=CurrentUser)
def get_me(current_user: HouseholdMember = Depends(get_current_user)) -> CurrentUser:
    return CurrentUser(
        id=current_user.id,
        email=current_user.email,
        display_name=current_user.display_name,
        is_admin=current_user.is_admin,
        is_active=current_user.is_active,
    )
