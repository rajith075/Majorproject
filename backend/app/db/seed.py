from sqlalchemy.orm import Session

from app.models.condition import Condition

DEFAULT_CONDITIONS = [
    "Diabetes",
    "Hypertension",
    "Heart Disease",
    "Kidney Disease",
    "Arthritis",
    "Parkinson's",
    "Alzheimer's",
    "Dementia",
    "Asthma",
    "COPD",
    "Stroke",
    "Cancer",
    "Depression",
    "Anxiety",
    "Thyroid Disorder",
    "Vision Problems",
    "Hearing Problems",
]


def seed_conditions(db: Session):

    for name in DEFAULT_CONDITIONS:

        exists = (
            db.query(Condition)
            .filter(Condition.name == name)
            .first()
        )

        if not exists:
            db.add(
                Condition(name=name)
            )

    db.commit()