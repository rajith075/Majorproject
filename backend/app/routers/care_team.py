from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.caregiver_patient import CaregiverPatient
from app.models.patient import Patient
from app.models.user import User
from app.schemas.care_team import (
    CaregiverInvitationCreate,
    CaregiverInvitationResponse,
    CareTeamResponse,
)


router = APIRouter(prefix="/care-team", tags=["Care Team"])


def _family_patient(db: Session, current_user: User) -> Patient:
    if current_user.role != "family":
        raise HTTPException(status_code=403, detail="Family member access required.")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return patient


@router.get("/me", response_model=CareTeamResponse)
def get_my_care_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _family_patient(db, current_user)
    caregivers = (
        db.query(CaregiverPatient)
        .filter(CaregiverPatient.patient_id == patient.id)
        .order_by(CaregiverPatient.created_at.desc())
        .all()
    )
    return CareTeamResponse(
        patient_id=patient.id,
        doctor_name=patient.assigned_doctor,
        hospital=patient.hospital,
        doctor_phone=patient.doctor_phone,
        caregivers=caregivers,
    )


@router.post(
    "/caregiver-invitations",
    response_model=CaregiverInvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def invite_caregiver(
    request: CaregiverInvitationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _family_patient(db, current_user)
    phone = request.phone.strip()
    email = request.email.strip().lower() if request.email else None

    duplicate_filters = [CaregiverPatient.caregiver_phone == phone]
    if email:
        duplicate_filters.append(CaregiverPatient.caregiver_email == email)

    existing = (
        db.query(CaregiverPatient)
        .filter(
            CaregiverPatient.patient_id == patient.id,
            CaregiverPatient.status.in_(["pending", "active"]),
            or_(*duplicate_filters),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="This caregiver already has a pending or active care-team invitation.",
        )

    invitation = CaregiverPatient(
        patient_id=patient.id,
        invited_by_id=current_user.id,
        caregiver_name=request.full_name.strip(),
        caregiver_phone=phone,
        caregiver_email=email,
        relationship_role=request.relationship_role.strip(),
        status="pending",
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


def _get_invitation_for_caregiver(
    invitation_id: int,
    db: Session,
    current_user: User,
) -> CaregiverPatient:
    if current_user.role != "caregiver":
        raise HTTPException(status_code=403, detail="Caregiver access required.")

    invitation = (
        db.query(CaregiverPatient)
        .filter(
            CaregiverPatient.id == invitation_id,
            or_(
                CaregiverPatient.caregiver_id == current_user.id,
                CaregiverPatient.caregiver_phone == current_user.phone,
                CaregiverPatient.caregiver_email == current_user.email,
            ),
        )
        .first()
    )
    if not invitation:
        raise HTTPException(status_code=404, detail="Caregiver invitation not found.")
    return invitation


@router.get("/caregiver-invitations", response_model=list[CaregiverInvitationResponse])
def get_caregiver_invitations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "caregiver":
        raise HTTPException(status_code=403, detail="Caregiver access required.")

    return (
        db.query(CaregiverPatient)
        .filter(
            CaregiverPatient.status == "pending",
            or_(
                CaregiverPatient.caregiver_id == current_user.id,
                CaregiverPatient.caregiver_phone == current_user.phone,
                CaregiverPatient.caregiver_email == current_user.email,
            ),
        )
        .order_by(CaregiverPatient.created_at.desc())
        .all()
    )


@router.post("/caregiver-invitations/{invitation_id}/accept", response_model=CaregiverInvitationResponse)
def accept_caregiver_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invitation = _get_invitation_for_caregiver(invitation_id, db, current_user)
    if invitation.status != "pending":
        raise HTTPException(status_code=409, detail="This invitation is no longer pending.")

    active_link = (
        db.query(CaregiverPatient)
        .filter(
            CaregiverPatient.patient_id == invitation.patient_id,
            CaregiverPatient.caregiver_id == current_user.id,
            CaregiverPatient.status == "active",
        )
        .first()
    )
    if active_link:
        raise HTTPException(status_code=409, detail="You are already on this patient's care team.")

    invitation.caregiver_id = current_user.id
    invitation.status = "active"
    invitation.responded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(invitation)
    return invitation


@router.post("/caregiver-invitations/{invitation_id}/decline", response_model=CaregiverInvitationResponse)
def decline_caregiver_invitation(
    invitation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    invitation = _get_invitation_for_caregiver(invitation_id, db, current_user)
    if invitation.status != "pending":
        raise HTTPException(status_code=409, detail="This invitation is no longer pending.")

    invitation.status = "declined"
    invitation.responded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(invitation)
    return invitation
