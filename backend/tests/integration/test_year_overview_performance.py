import time


def test_year_overview_under_budget(client, auth_cookie) -> None:
    for idx in range(10):
        client.post(
            "/api/years/2026/expenses",
            cookies=auth_cookie,
            json={"title": f"Expense {idx}", "amount": "10.00", "status": "planned"},
        )

    start = time.perf_counter()
    response = client.get("/api/years/2026/expenses", cookies=auth_cookie)
    summary = client.get("/api/years/2026/summary", cookies=auth_cookie)
    elapsed = time.perf_counter() - start

    assert response.status_code == 200
    assert summary.status_code == 200
    assert elapsed < 2.0

