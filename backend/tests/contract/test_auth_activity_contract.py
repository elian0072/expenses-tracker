from app.main import app


def test_auth_and_activity_paths() -> None:
    schema = app.openapi()
    assert "/api/auth/login" in schema["paths"]
    assert "/api/auth/logout" in schema["paths"]
    assert "/api/auth/me" in schema["paths"]
    assert "/api/activity" in schema["paths"]
    assert "/api/admin/users" in schema["paths"]
    assert "/api/admin/users/{userId}" in schema["paths"]

    current_user_props = schema["components"]["schemas"]["CurrentUser"]["properties"]
    assert "is_admin" in current_user_props
    assert "is_active" in current_user_props
