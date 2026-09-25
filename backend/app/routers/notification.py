from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.device_token import DeviceToken
from app.models.user import User
from app.schemas.notification import DeviceTokenCreate


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("/device-token", status_code=status.HTTP_204_NO_CONTENT)
def register_device_token(
    request: DeviceTokenCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Associate the current browser's FCM token with its account."""
    token = request.token.strip()
    existing = db.query(DeviceToken).filter(DeviceToken.token == token).first()
    if existing:
        existing.user_id = current_user.id
    else:
        db.add(DeviceToken(user_id=current_user.id, token=token))
    db.commit()
