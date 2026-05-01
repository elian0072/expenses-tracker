import time


def test_expense_mutation_under_budget(client, auth_cookie) -> None:
    start = time.perf_counter()
    response = client.post(
        "/api/years/2026/expenses",
        cookies=auth_cookie,
        json={"title": "Performance", "amount": "90.00", "status": "planned"},
    )
    elapsed = time.perf_counter() - start

    assert response.status_code == 201
    assert elapsed < 1.0

