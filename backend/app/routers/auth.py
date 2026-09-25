from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.core.security import create_access_token
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.caregiver_invitation_service import CaregiverInvitationService


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

    try:
        user = AuthService.register(db, request)
        if not user:
            raise HTTPException(status_code=400, detail="Email already exists or role is invalid")

        if request.invitation_token:
            if user.role != "caregiver":
                raise HTTPException(
                    status_code=422,
                    detail="An invitation token can only be used to create a caregiver account.",
                )
            CaregiverInvitationService.accept(db, request.invitation_token, user, commit=False)

        db.commit()
        db.refresh(user)
    except HTTPException:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise

    response = {"message": "Account created successfully"}
    if request.invitation_token:
        response.update(
            access_token=create_access_token({"sub": user.email, "id": user.id}),
            token_type="bearer",
        )
    return response


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
        form_data.username,
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


# ==========================================================
# Get Current Logged-in User
# ==========================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user
