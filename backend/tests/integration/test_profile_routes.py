from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.member import HouseholdMember


def test_profile_requires_authentication(client) -> None:
    get_response = client.get("/api/profile")
    assert get_response.status_code == 401

    patch_response = client.patch("/api/profile", json={"display_name": "Nope"})
    assert patch_response.status_code == 401


def test_authenticated_member_can_read_profile(client, non_admin_cookie) -> None:
    response = client.get("/api/profile", cookies=non_admin_cookie)
    assert response.status_code == 200

    body = response.json()
    assert body["email"] == "member@example.com"
    assert body["display_name"] == "Household Member"
    assert body["is_admin"] is False


def test_authenticated_member_can_update_profile_and_refresh_session(client, non_admin_cookie) -> None:
    update_response = client.patch(
        "/api/profile",
        cookies=non_admin_cookie,
        json={"display_name": "Updated Member", "email": "updated-member@example.com"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["display_name"] == "Updated Member"
    assert update_response.json()["email"] == "updated-member@example.com"

    me_response = client.get("/api/auth/me", cookies=non_admin_cookie)
    assert me_response.status_code == 200
    assert me_response.json()["display_name"] == "Updated Member"
    assert me_response.json()["email"] == "updated-member@example.com"


def test_profile_update_rejects_duplicate_email(client, auth_cookie) -> None:
    with SessionLocal() as db:
        existing = HouseholdMember(
            email="already-used@example.com",
            display_name="Already Used",
            password_hash=hash_password("another-password"),
            is_active=True,
            is_admin=False,
        )
        db.add(existing)
        db.commit()

    response = client.patch(
        "/api/profile",
        cookies=auth_cookie,
        json={"email": "already-used@example.com"},
    )
    assert response.status_code == 409
    assert response.json()["code"] == "email_conflict"
