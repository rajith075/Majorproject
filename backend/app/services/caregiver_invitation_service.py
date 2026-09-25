import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.caregiver_invitation import CaregiverInvitation
from app.models.caregiver_patient import CaregiverPatient
from app.models.patient import Patient
from app.models.user import User


class CaregiverInvitationService:
    EXPIRY_DAYS = 7

    @staticmethod
    def token_hash(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @classmethod
    def create(
        cls,
        db: Session,
        patient: Patient,
        invited_by: User,
        invited_email: str,
        relationship: str,
        message: str | None,
    ) -> tuple[CaregiverInvitation, str]:
        token = secrets.token_urlsafe(32)
        normalized_email = invited_email.strip().lower()
        existing = (
            db.query(CaregiverInvitation)
            .filter(
                CaregiverInvitation.patient_id == patient.id,
                CaregiverInvitation.invited_email == normalized_email,
                CaregiverInvitation.status == "pending",
            )
            .first()
        )
        if existing:
            existing_expiry = existing.expires_at
            if existing_expiry.tzinfo is None:
                existing_expiry = existing_expiry.replace(tzinfo=timezone.utc)
            if existing_expiry <= datetime.now(timezone.utc):
                existing.status = "expired"
                db.flush()
            else:
                raise HTTPException(
                    status_code=409,
                    detail="A pending invitation has already been sent to this email address.",
                )

        invitation = CaregiverInvitation(
            patient_id=patient.id,
            invited_by_id=invited_by.id,
            invited_email=normalized_email,
            relationship=relationship.strip(),
            message=message.strip() if message else None,
            token_hash=cls.token_hash(token),
            status="pending",
            expires_at=datetime.now(timezone.utc) + timedelta(days=cls.EXPIRY_DAYS),
        )
        db.add(invitation)
        db.flush()
        return invitation, token

    @classmethod
    def get_pending_by_token(cls, db: Session, token: str) -> CaregiverInvitation:
        invitation = (
            db.query(CaregiverInvitation)
            .filter(CaregiverInvitation.token_hash == cls.token_hash(token))
            .first()
        )
        if not invitation:
            raise HTTPException(status_code=404, detail="Invitation not found.")

        now = datetime.now(timezone.utc)
        expires_at = invitation.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if invitation.status == "pending" and expires_at <= now:
            invitation.status = "expired"
            # Never commit here: this method is also called while creating a
            # caregiver account, where invitation acceptance must stay atomic.
            db.flush()

        if invitation.status != "pending":
            raise HTTPException(status_code=410, detail="This invitation is no longer available.")
        return invitation

    @classmethod
    def accept(
        cls,
        db: Session,
        token: str,
        caregiver: User,
        *,
        commit: bool = True,
    ) -> CaregiverPatient:
        if caregiver.role != "caregiver":
            raise HTTPException(status_code=403, detail="A caregiver account is required.")

        invitation = cls.get_pending_by_token(db, token)
        if caregiver.email.strip().lower() != invitation.invited_email:
            raise HTTPException(
                status_code=403,
                detail="Sign in with the email address that received this invitation.",
            )

        existing = (
            db.query(CaregiverPatient)
            .filter(
                CaregiverPatient.patient_id == invitation.patient_id,
                CaregiverPatient.caregiver_id == caregiver.id,
                CaregiverPatient.status == "active",
            )
            .first()
        )
        if existing:
            invitation.status = "accepted"
            invitation.accepted_by_id = caregiver.id
            invitation.responded_at = datetime.now(timezone.utc)
            if commit:
                db.commit()
            return existing

        relationship = CaregiverPatient(
            patient_id=invitation.patient_id,
            caregiver_id=caregiver.id,
            invited_by_id=invitation.invited_by_id,
            caregiver_name=caregiver.full_name,
            caregiver_phone=caregiver.phone,
            caregiver_email=caregiver.email,
            relationship_role=invitation.relationship,
            status="active",
            responded_at=datetime.now(timezone.utc),
        )
        invitation.status = "accepted"
        invitation.accepted_by_id = caregiver.id
        invitation.responded_at = datetime.now(timezone.utc)
        db.add(relationship)
        if commit:
            db.commit()
            db.refresh(relationship)
        else:
            db.flush()
        return relationship
