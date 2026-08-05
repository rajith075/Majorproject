from sqlalchemy.orm import Session

from app.models.condition import Condition


class ConditionService:

    @staticmethod
    def create(db: Session, name: str):

        existing = (
            db.query(Condition)
            .filter(Condition.name == name)
            .first()
        )

        if existing:
            return existing

        condition = Condition(name=name)

        db.add(condition)
        db.commit()
        db.refresh(condition)

        return condition

    @staticmethod
    def get_all(db: Session):

        return (
            db.query(Condition)
            .order_by(Condition.name)
            .all()
        )