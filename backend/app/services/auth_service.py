from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import AppError
from app.core.security import (
    create_session_token,
    get_session_expiry,
    hash_password,
    verify_password,
)
from app.models.member import HouseholdMember
from app.models.session import UserSession


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def ensure_seed_user(self) -> HouseholdMember:
        settings = get_settings()
        existing = self.db.scalar(select(HouseholdMember).where(HouseholdMember.email == settings.seed_admin_email))
        if existing:
            if not existing.is_admin:
                existing.is_admin = True
                self.db.add(existing)
                self.db.commit()
                self.db.refresh(existing)
            return existing
        member = HouseholdMember(
            email=settings.seed_admin_email,
            display_name=settings.seed_admin_display_name,
            password_hash=hash_password(settings.seed_admin_password),
            is_active=True,
            is_admin=True,
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def login(self, email: str, password: str, user_agent: str | None) -> tuple[HouseholdMember, UserSession]:
        member = self.db.scalar(select(HouseholdMember).where(HouseholdMember.email == email))
        if not member or not verify_password(password, member.password_hash):
            raise AppError(status_code=401, message="Invalid credentials", code="invalid_credentials")
        if not member.is_active:
            raise AppError(status_code=403, message="Account is inactive", code="inactive_account")

        session = UserSession(
            member_id=member.id,
            session_token=create_session_token(),
            expires_at=get_session_expiry(),
            user_agent=user_agent,
        )
        member.last_login_at = datetime.now(UTC)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        self.db.refresh(member)
        return member, session

    def logout(self, session_token: str | None) -> None:
        if not session_token:
            return
        session = self.db.scalar(select(UserSession).where(UserSession.session_token == session_token))
        if not session:
            return
        session.revoked_at = datetime.now(UTC)
        self.db.add(session)
        self.db.commit()

    def get_member_by_session_token(self, session_token: str) -> HouseholdMember | None:
        session = self.db.scalar(select(UserSession).where(UserSession.session_token == session_token))
        if not session:
            return None
        if session.revoked_at is not None:
            return None
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if expires_at < datetime.now(UTC):
            return None

        session.last_seen_at = datetime.now(UTC)
        self.db.add(session)
        self.db.commit()
        member = self.db.get(HouseholdMember, session.member_id)
        if not member or not member.is_active:
            return None
        return member
