from decimal import Decimal

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.expense import ExpenseEntry, ExpenseStatus
from app.services.auth_service import AuthService


def main() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        owner = AuthService(db).ensure_seed_user()
        exists = db.query(ExpenseEntry).count()
        if exists > 0:
            return
        db.add_all(
            [
                ExpenseEntry(
                    title="Home insurance",
                    amount=Decimal("950.00"),
                    planning_year=2026,
                    status=ExpenseStatus.planned,
                    created_by_id=owner.id,
                    updated_by_id=owner.id,
                ),
                ExpenseEntry(
                    title="Laptop replacement",
                    amount=Decimal("1400.00"),
                    planning_year=2026,
                    status=ExpenseStatus.purchased,
                    created_by_id=owner.id,
                    updated_by_id=owner.id,
                ),
            ]
        )
        db.commit()


if __name__ == "__main__":
    main()

