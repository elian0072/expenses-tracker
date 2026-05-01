from app.main import app


def test_admin_users_contract_paths_and_schemas() -> None:
    schema = app.openapi()
    assert "/api/admin/users" in schema["paths"]
    assert "/api/admin/users/{userId}" in schema["paths"]

    user_create_props = schema["components"]["schemas"]["UserCreateRequest"]["properties"]
    assert "email" in user_create_props
    assert "password" in user_create_props
    assert "display_name" in user_create_props
    assert "is_admin" in user_create_props

