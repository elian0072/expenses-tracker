def test_expense_crud(client, non_admin_cookie, auth_cookie) -> None:
    create_response = client.post(
        "/api/years/2026/expenses",
        cookies=non_admin_cookie,
        json={"title": "Internet", "amount": "59.99", "status": "planned"},
    )
    assert create_response.status_code == 201
    expense = create_response.json()

    list_response = client.get("/api/years/2026/expenses", cookies=non_admin_cookie)
    assert list_response.status_code == 200
    assert len(list_response.json()["items"]) == 1

    patch_response = client.patch(
        f"/api/expenses/{expense['id']}",
        cookies=non_admin_cookie,
        json={"version": expense["version"], "status": "purchased"},
    )
    assert patch_response.status_code == 200
    assert patch_response.json()["status"] == "purchased"

    delete_response = client.delete(f"/api/expenses/{expense['id']}", cookies=non_admin_cookie)
    assert delete_response.status_code == 204

    activity_response = client.get("/api/activity?year=2026", cookies=auth_cookie)
    assert activity_response.status_code == 200
    items = activity_response.json()["items"]
    assert any(item["subject_type"] == "expense" and item["subject_id"] == expense["id"] for item in items)
