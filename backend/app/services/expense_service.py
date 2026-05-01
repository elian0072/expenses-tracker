from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.activity import ActivityAction, ActivitySubjectType
from app.models.expense import ExpenseEntry, ExpenseStatus
from app.models.member import HouseholdMember
from app.schemas.expense import ExpenseCreateRequest, ExpenseUpdateRequest
from app.services.activity_service import ActivityService


class ExpenseService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.activity_service = ActivityService(db)

    def list_expenses(self, year: int, status: ExpenseStatus | None = None) -> list[ExpenseEntry]:
        query = select(ExpenseEntry).where(ExpenseEntry.planning_year == year).order_by(ExpenseEntry.updated_at.desc())
        if status:
            query = query.where(ExpenseEntry.status == status)
        return list(self.db.scalars(query))

    def create_expense(self, actor: HouseholdMember, year: int, payload: ExpenseCreateRequest) -> ExpenseEntry:
        self._validate_target_date(year, payload.target_date)
        expense = ExpenseEntry(
            title=payload.title,
            amount=payload.amount,
            planning_year=year,
            target_date=payload.target_date,
            notes=payload.notes,
            status=payload.status,
            created_by_id=actor.id,
            updated_by_id=actor.id,
        )
        self.db.add(expense)
        self.db.flush()
        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.created,
            planning_year=year,
            summary=f"Created expense '{expense.title}'",
            details={"status": expense.status.value, "amount": str(expense.amount)},
            subject_type=ActivitySubjectType.expense,
            subject_id=expense.id,
            expense_id=expense.id,
        )
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def update_expense(self, actor: HouseholdMember, expense_id: UUID, payload: ExpenseUpdateRequest) -> ExpenseEntry:
        expense = self.db.get(ExpenseEntry, expense_id)
        if not expense:
            raise AppError(status_code=404, message="Expense not found", code="expense_not_found")
        if expense.version != payload.version:
            raise AppError(status_code=409, message="Stale expense version", code="stale_version")

        prior_status = expense.status
        if payload.title is not None:
            expense.title = payload.title
        if payload.amount is not None:
            expense.amount = payload.amount
        if payload.status is not None:
            expense.status = payload.status
        if payload.target_date is not None:
            self._validate_target_date(expense.planning_year, payload.target_date)
            expense.target_date = payload.target_date
        if payload.notes is not None:
            expense.notes = payload.notes

        expense.updated_by_id = actor.id
        expense.version += 1
        self.db.add(expense)

        action = ActivityAction.status_changed if prior_status != expense.status else ActivityAction.updated
        self.activity_service.record(
            actor=actor,
            action_type=action,
            planning_year=expense.planning_year,
            summary=f"Updated expense '{expense.title}'",
            details={"status": expense.status.value, "amount": str(expense.amount)},
            subject_type=ActivitySubjectType.expense,
            subject_id=expense.id,
            expense_id=expense.id,
        )
        self.db.commit()
        self.db.refresh(expense)
        return expense

    def delete_expense(self, actor: HouseholdMember, expense_id: UUID) -> None:
        expense = self.db.get(ExpenseEntry, expense_id)
        if not expense:
            raise AppError(status_code=404, message="Expense not found", code="expense_not_found")

        planning_year = expense.planning_year
        title = expense.title
        self.activity_service.record(
            actor=actor,
            action_type=ActivityAction.deleted,
            planning_year=planning_year,
            summary=f"Deleted expense '{title}'",
            details={"status": expense.status.value, "amount": str(expense.amount)},
            subject_type=ActivitySubjectType.expense,
            subject_id=expense.id,
            expense_id=expense.id,
        )
        self.db.delete(expense)
        self.db.commit()

    @staticmethod
    def _validate_target_date(year: int, target_date) -> None:
        if target_date and target_date.year != year:
            raise AppError(status_code=400, message="target_date must match planning year", code="invalid_target_date")

    @staticmethod
    def get_totals(expenses: list[ExpenseEntry]) -> tuple[Decimal, Decimal]:
        planned_total = sum((expense.amount for expense in expenses if expense.status == ExpenseStatus.planned), Decimal(0))
        purchased_total = sum(
            (expense.amount for expense in expenses if expense.status == ExpenseStatus.purchased), Decimal(0)
        )
        return planned_total, purchased_total
