from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.config import settings
from app.db.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.caregiver_patient import CaregiverPatient
from app.models.caregiver_invitation import CaregiverInvitation
from app.schemas.caregiver import (
    CaregiverInvitationSummary,
    CaregiverInviteRequest,
    CaregiverTeamMember,
    CareTeamResponse,
    InvitationPreview,
)
from app.services.caregiver_invitation_service import CaregiverInvitationService
from app.services.email_service import EmailDeliveryError, EmailService


router = APIRouter(
    prefix="/caregiver",
    tags=["Caregiver"],
)


def _family_patient(db: Session, current_user: User) -> Patient:
    if current_user.role != "family":
        raise HTTPException(status_code=403, detail="Family member access required.")

    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")
    return patient


def _invitation_summary(invitation: CaregiverInvitation) -> CaregiverInvitationSummary:
    return CaregiverInvitationSummary(
        id=invitation.id,
        invited_email=invitation.invited_email,
        relationship=invitation.relationship,
        message=invitation.message,
        status=invitation.status,
        created_at=invitation.created_at,
        expires_at=invitation.expires_at,
    )


@router.get("/team", response_model=CareTeamResponse)
def get_care_team(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    patient = _family_patient(db, current_user)
    links = (
        db.query(CaregiverPatient, User)
        .join(User, CaregiverPatient.caregiver_id == User.id)
        .filter(
            CaregiverPatient.patient_id == patient.id,
            CaregiverPatient.status == "active",
        )
        .order_by(CaregiverPatient.created_at.desc())
        .all()
    )
    invitations = (
        db.query(CaregiverInvitation)
        .filter(
            CaregiverInvitation.patient_id == patient.id,
            CaregiverInvitation.status == "pending",
        )
        .order_by(CaregiverInvitation.created_at.desc())
        .all()
    )
    return CareTeamResponse(
        patient_id=patient.id,
        doctor_name=patient.assigned_doctor,
        hospital=patient.hospital,
        doctor_phone=patient.doctor_phone,
        caregivers=[
            CaregiverTeamMember(
                id=link.id,
                full_name=user.full_name,
                email=user.email,
                phone=user.phone,
                relationship=link.relationship_role,
                status=link.status,
                created_at=link.created_at,
            )
            for link, user in links
        ],
        invitations=[_invitation_summary(invitation) for invitation in invitations],
    )


@router.post("/invite", response_model=CaregiverInvitationSummary, status_code=status.HTTP_201_CREATED)
def invite_caregiver(
    request: CaregiverInviteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Send a single-use email invitation; no patient access is granted yet."""
    patient = _family_patient(db, current_user)
    invitation, raw_token = CaregiverInvitationService.create(
        db=db,
        patient=patient,
        invited_by=current_user,
        invited_email=str(request.invited_email),
        relationship=request.relationship,
        message=request.message,
    )
    invitation_url = f"{settings.APP_BASE_URL.rstrip('/')}/caregiver-invitation?token={raw_token}"

    try:
        # The invitation remains uncommitted if delivery cannot start, so the
        # family can correct configuration/address and safely retry.
        EmailService.send_caregiver_invitation(
            recipient_email=invitation.invited_email,
            family_name=current_user.full_name,
            patient_name=patient.full_name,
            relationship=invitation.relationship,
            invitation_url=invitation_url,
            message=invitation.message,
        )
        db.commit()
        db.refresh(invitation)
    except EmailDeliveryError as error:
        db.rollback()
        raise HTTPException(status_code=503, detail=str(error)) from error
    except Exception:
        db.rollback()
        raise

    return _invitation_summary(invitation)


@router.get("/invitations/{token}", response_model=InvitationPreview)
def preview_invitation(token: str, db: Session = Depends(get_db)):
    invitation = CaregiverInvitationService.get_pending_by_token(db, token)
    patient = db.get(Patient, invitation.patient_id)
    family = db.get(User, invitation.invited_by_id)
    if not patient or not family:
        raise HTTPException(status_code=404, detail="Invitation details are unavailable.")
    return InvitationPreview(
        invited_email=invitation.invited_email,
        patient_name=patient.full_name,
        family_name=family.full_name,
        relationship=invitation.relationship,
        message=invitation.message,
        expires_at=invitation.expires_at,
    )


@router.post("/invitations/{token}/accept", response_model=CaregiverTeamMember)
def accept_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        link = CaregiverInvitationService.accept(db, token, current_user)
    except Exception:
        db.rollback()
        raise
    return CaregiverTeamMember(
        id=link.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        relationship=link.relationship_role,
        status=link.status,
        created_at=link.created_at,
    )


# ==========================================================
# Get Patients Assigned To Logged-in Caregiver
# ==========================================================

@router.get("/patients")
def get_caregiver_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    if current_user.role != "caregiver":
        raise HTTPException(
            status_code=403,
            detail="Only caregivers can access assigned patients.",
        )

    patients = (
        db.query(Patient)
        .join(
            CaregiverPatient,
            CaregiverPatient.patient_id == Patient.id,
        )
        .filter(
            CaregiverPatient.caregiver_id == current_user.id,
            CaregiverPatient.status == "active",
        )
        .all()
    )

    return patients
