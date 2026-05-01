from app.main import app


def test_profile_contract_paths_and_schemas() -> None:
    schema = app.openapi()

    assert "/api/profile" in schema["paths"]
    assert "get" in schema["paths"]["/api/profile"]
    assert "patch" in schema["paths"]["/api/profile"]

    profile_response_props = schema["components"]["schemas"]["ProfileResponse"]["properties"]
    assert "id" in profile_response_props
    assert "email" in profile_response_props
    assert "display_name" in profile_response_props
    assert "last_login_at" in profile_response_props

    profile_update_props = schema["components"]["schemas"]["ProfileUpdateRequest"]["properties"]
    assert "email" in profile_update_props
    assert "display_name" in profile_update_props
