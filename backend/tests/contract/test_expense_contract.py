from app.main import app


def test_expense_contract_paths() -> None:
    schema = app.openapi()
    assert "/api/years/{year}/expenses" in schema["paths"]
    assert "/api/expenses/{expenseId}" in schema["paths"]
