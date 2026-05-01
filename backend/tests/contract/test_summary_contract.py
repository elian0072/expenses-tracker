from app.main import app


def test_summary_contract_path() -> None:
    schema = app.openapi()
    assert "/api/years/{year}/summary" in schema["paths"]

