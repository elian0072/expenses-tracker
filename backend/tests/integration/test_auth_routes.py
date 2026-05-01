def test_auth_flow(client) -> None:
    me_unauthenticated = client.get("/api/auth/me")
    assert me_unauthenticated.status_code == 401

    login = client.post("/api/auth/login", json={"email": "owner@example.com", "password": "change-me-please"})
    assert login.status_code == 200
    body = login.json()
    assert body["is_admin"] is True
    assert body["is_active"] is True
    cookie = {"expense_session": login.cookies.get("expense_session")}

    me = client.get("/api/auth/me", cookies=cookie)
    assert me.status_code == 200
    assert me.json()["is_admin"] is True

    logout = client.post("/api/auth/logout", cookies=cookie)
    assert logout.status_code == 204


def test_non_admin_activity_is_forbidden(client, non_admin_cookie) -> None:
    forbidden = client.get("/api/activity", cookies=non_admin_cookie)
    assert forbidden.status_code == 403
    assert forbidden.json()["code"] == "admin_required"
