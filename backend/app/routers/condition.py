from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.condition import ConditionCreate
from app.services.condition import ConditionService

router = APIRouter(
    prefix="/conditions",
    tags=["Conditions"],
)


@router.get("/")
def get_conditions(
    db: Session = Depends(get_db),
):
    return ConditionService.get_all(db)


@router.post("/")
def create_condition(
    request: ConditionCreate,
    db: Session = Depends(get_db),
):
    return ConditionService.create(
        db,
        request.name,
    )