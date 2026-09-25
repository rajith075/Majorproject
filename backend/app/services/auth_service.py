from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import RegisterRequest

from app.core.security import (
    hash_password,
    verify_password,
)


class AuthService:

    # ==========================================================
    # Register
    # ==========================================================

    @staticmethod
    def register(
        db: Session,
        request: RegisterRequest,
    ):

        # ------------------------------------------------------
        # Check existing email
        # ------------------------------------------------------

        existing = (
            db.query(User)
            .filter(User.email == request.email)
            .first()
        )

        if existing:
            return None

        # ------------------------------------------------------
        # Validate role
        # ------------------------------------------------------

        allowed_roles = {
            "family",
            "caregiver",
            "doctor",
        }

        role = request.role.lower().strip()

        if role not in allowed_roles:
            return None

        # ------------------------------------------------------
        # Create user
        # ------------------------------------------------------

        user = User(
            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            password=hash_password(request.password),
            role=role,
        )

        # The caller owns the transaction. This lets caregiver registration and
        # invitation acceptance succeed or fail as one operation.
        db.add(user)
        db.flush()

        return user

    # ==========================================================
    # Login
    # ==========================================================

    @staticmethod
    def login(
        db: Session,
        email: str,
        password: str,
    ):

        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if not user:
            return None

        if not verify_password(
            password,
            user.password,
        ):
            return None

        return user
