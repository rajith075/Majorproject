from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.core.security import (
    hash_password,
    verify_password,
)


class AuthService:

    @staticmethod
    def register(
        db: Session,
        request: RegisterRequest,
    ):

        existing = (
            db.query(User)
            .filter(User.email == request.email)
            .first()
        )

        if existing:
            return None

        user = User(
            full_name=request.full_name,
            email=request.email,
            phone=request.phone,
            password=hash_password(request.password),
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return user

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