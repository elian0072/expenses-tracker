from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.main import app
from app.models.member import HouseholdMember
from app.services.auth_service import AuthService


@pytest.fixture(autouse=True)
def reset_db() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        AuthService(db).ensure_seed_user()
    yield


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def auth_cookie(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"email": "owner@example.com", "password": "change-me-please"},
    )
    assert response.status_code == 200
    cookie = response.cookies.get("expense_session")
    assert cookie is not None
    return {"expense_session": cookie}


@pytest.fixture
def member() -> HouseholdMember:
    with SessionLocal() as db:
        value = db.query(HouseholdMember).filter(HouseholdMember.email == "owner@example.com").one()
        return value


@pytest.fixture
def non_admin_member() -> HouseholdMember:
    with SessionLocal() as db:
        existing = db.query(HouseholdMember).filter(HouseholdMember.email == "member@example.com").one_or_none()
        if existing is None:
            existing = HouseholdMember(
                email="member@example.com",
                display_name="Household Member",
                password_hash=hash_password("member-password"),
                is_active=True,
                is_admin=False,
            )
            db.add(existing)
            db.commit()
            db.refresh(existing)
        return existing


@pytest.fixture
def non_admin_cookie(client: TestClient, non_admin_member: HouseholdMember) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"email": non_admin_member.email, "password": "member-password"},
    )
    assert response.status_code == 200
    cookie = response.cookies.get("expense_session")
    assert cookie is not None
    return {"expense_session": cookie}
