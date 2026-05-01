from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.db.session import get_db
from app.models.expense import ExpenseStatus
from app.models.member import HouseholdMember
from app.schemas.expense import (
    ExpenseCreateRequest,
    ExpenseListResponse,
    ExpenseResponse,
    ExpenseUpdateRequest,
)
from app.services.expense_service import ExpenseService

router = APIRouter(tags=["expenses"])


@router.get("/api/years/{year}/expenses", response_model=ExpenseListResponse)
def list_expenses(
    year: int,
    status_filter: ExpenseStatus | None = Query(default=None, alias="status"),
    _: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseListResponse:
    expenses = ExpenseService(db).list_expenses(year=year, status=status_filter)
    return ExpenseListResponse(year=year, items=[ExpenseResponse.model_validate(expense) for expense in expenses])


@router.post("/api/years/{year}/expenses", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    year: int,
    payload: ExpenseCreateRequest,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseResponse:
    expense = ExpenseService(db).create_expense(actor=current_user, year=year, payload=payload)
    return ExpenseResponse.model_validate(expense)


@router.patch("/api/expenses/{expenseId}", response_model=ExpenseResponse)
def update_expense(
    expenseId: UUID,
    payload: ExpenseUpdateRequest,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExpenseResponse:
    expense = ExpenseService(db).update_expense(actor=current_user, expense_id=expenseId, payload=payload)
    return ExpenseResponse.model_validate(expense)


@router.delete("/api/expenses/{expenseId}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expenseId: UUID,
    current_user: HouseholdMember = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    ExpenseService(db).delete_expense(actor=current_user, expense_id=expenseId)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
