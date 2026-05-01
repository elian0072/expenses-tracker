def test_admin_can_manage_users(client, auth_cookie) -> None:
    create_response = client.post(
        "/api/admin/users",
        cookies=auth_cookie,
        json={
            "email": "editor@example.com",
            "password": "editor-pass-123",
            "display_name": "Editor",
            "is_admin": False,
            "is_active": True,
        },
    )
    assert create_response.status_code == 201
    created = create_response.json()
    assert created["email"] == "editor@example.com"
    assert created["is_admin"] is False

    list_response = client.get("/api/admin/users", cookies=auth_cookie)
    assert list_response.status_code == 200
    assert any(item["email"] == "editor@example.com" for item in list_response.json()["items"])

    patch_response = client.patch(
        f"/api/admin/users/{created['id']}",
        cookies=auth_cookie,
        json={"display_name": "Editor Updated", "is_admin": True},
    )
    assert patch_response.status_code == 200
    patched = patch_response.json()
    assert patched["display_name"] == "Editor Updated"
    assert patched["is_admin"] is True

    delete_response = client.delete(f"/api/admin/users/{created['id']}", cookies=auth_cookie)
    assert delete_response.status_code == 204


def test_non_admin_cannot_access_admin_user_routes(client, non_admin_cookie) -> None:
    response = client.get("/api/admin/users", cookies=non_admin_cookie)
    assert response.status_code == 403
    assert response.json()["code"] == "admin_required"

