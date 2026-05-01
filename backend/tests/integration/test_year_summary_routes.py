def test_year_summary_and_filtering(client, non_admin_cookie) -> None:
    client.post(
        "/api/years/2026/expenses",
        cookies=non_admin_cookie,
        json={"title": "Planned", "amount": "100.00", "status": "planned"},
    )
    client.post(
        "/api/years/2026/expenses",
        cookies=non_admin_cookie,
        json={"title": "Purchased", "amount": "55.00", "status": "purchased"},
    )
    client.post(
        "/api/years/2026/expenses",
        cookies=non_admin_cookie,
        json={"title": "Canceled", "amount": "20.00", "status": "canceled"},
    )

    summary_response = client.get("/api/years/2026/summary", cookies=non_admin_cookie)
    assert summary_response.status_code == 200
    summary = summary_response.json()
    assert summary["planned_total"] == "100.00"
    assert summary["purchased_total"] == "55.00"
    assert summary["canceled_count"] == 1

    filtered = client.get("/api/years/2026/expenses?status=planned", cookies=non_admin_cookie)
    assert filtered.status_code == 200
    assert len(filtered.json()["items"]) == 1
