from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.database import get_db
from app.models.user import User

# ==========================================================
# OAuth2 Scheme
# (Swagger will authenticate using /auth/token)
# ==========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token",
)


# ==========================================================
# Get Current User
# ==========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):

    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = (
        db.query(User)
        .filter(User.id == payload["id"])
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    return user