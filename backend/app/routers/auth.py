from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import RegisterRequest, LoginRequest
from app.services.auth_service import AuthService
from app.core.security import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ==========================================================
# Register
# ==========================================================

@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):

    user = AuthService.register(db, request)

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    return {
        "message": "Account created successfully"
    }


# ==========================================================
# Login (Used by Frontend)
# ==========================================================

@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):

    user = AuthService.login(
        db,
        request.email,
        request.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": user.email,
            "id": user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }


# ==========================================================
# OAuth2 Login (Used by Swagger)
# ==========================================================

@router.post("/token")
def token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    user = AuthService.login(
        db,
        form_data.username,   # Enter email in Swagger username field
        form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    token = create_access_token(
        {
            "sub": user.email,
            "id": user.id,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
    }