from app.services.auth_service import AuthService


def test_login_and_session_lookup() -> None:
    from app.db.session import SessionLocal

    with SessionLocal() as db:
        service = AuthService(db)
        member, session = service.login("owner@example.com", "change-me-please", "pytest-agent")
        assert member.email == "owner@example.com"
        assert member.is_admin is True
        resolved = service.get_member_by_session_token(session.session_token)
        assert resolved is not None
        assert resolved.id == member.id
