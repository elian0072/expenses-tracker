import time


def test_activity_and_auth_responses_under_budget(client, auth_cookie) -> None:
    client.post(
        "/api/years/2026/expenses",
        cookies=auth_cookie,
        json={"title": "Audit Performance", "amount": "25.00", "status": "planned"},
    )

    start = time.perf_counter()
    me_response = client.get("/api/auth/me", cookies=auth_cookie)
    activity_response = client.get("/api/activity?year=2026", cookies=auth_cookie)
    elapsed = time.perf_counter() - start

    assert me_response.status_code == 200
    assert activity_response.status_code == 200
    assert elapsed < 2.0

