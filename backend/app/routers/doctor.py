import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
)
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.doctor_verification import DoctorVerification
from app.models.doctor_profile import DoctorProfile
from app.models.consultation import Consultation
from app.schemas.auth import RegisterRequest
from app.schemas.doctor_verification import (
    DoctorRegisterRequest,
    DoctorRegistrationResponse,
)
from app.schemas.doctor_profile import (
    DoctorProfileCreate,
    DoctorProfileResponse,
)
from app.schemas.consultation import (
    ConsultationCreate,
    FamilyConsultationCreate,
    ConsultationNotesUpdate,
    ConsultationResponse,
    ConsultationStatusUpdate,
)
from app.schemas.patient import PatientNotesUpdate
from app.schemas.vital_log import DoctorBloodPressureCreate
from app.services.auth_service import AuthService
from app.models.doctor_patient import DoctorPatient
from app.models.vital_log import VitalLog


router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"],
)


# ==========================================================
# Doctor Registration
# ==========================================================

@router.post(
    "/register",
    response_model=DoctorRegistrationResponse,
)
def register_doctor(
    request: DoctorRegisterRequest,
    db: Session = Depends(get_db),
):
    existing_email = (
        db.query(User)
        .filter(User.email == request.email)
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

    existing_phone = (
        db.query(User)
        .filter(User.phone == request.phone)
        .first()
    )

    if existing_phone:
        raise HTTPException(
            status_code=400,
            detail="Phone number already exists",
        )

    auth_request = RegisterRequest(
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        password=request.password,
        role="doctor",
    )

    doctor = AuthService.register(
        db,
        auth_request,
    )

    if not doctor:
        raise HTTPException(
            status_code=400,
            detail="Unable to create doctor account",
        )

    verification = DoctorVerification(
        doctor_id=doctor.id,
        verification_status="pending",
    )

    db.add(verification)
    db.commit()
    db.refresh(verification)

    return DoctorRegistrationResponse(
        message="Doctor registration submitted successfully",
        doctor_id=doctor.id,
        verification_status="pending",
    )


# ==========================================================
# Doctor Document Upload
# ==========================================================

@router.post("/{doctor_id}/documents")
async def upload_doctor_documents(
    doctor_id: int,
    medical_certificate: UploadFile = File(...),
    clinic_license: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    doctor = (
        db.query(User)
        .filter(
            User.id == doctor_id,
            User.role == "doctor",
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    verification = (
        db.query(DoctorVerification)
        .filter(
            DoctorVerification.doctor_id == doctor_id
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=404,
            detail="Doctor verification record not found",
        )

    allowed_extensions = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
    }

    medical_extension = os.path.splitext(
        medical_certificate.filename or ""
    )[1].lower()

    if medical_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Medical certificate must be PDF, JPG, JPEG, or PNG",
        )

    license_extension = os.path.splitext(
        clinic_license.filename or ""
    )[1].lower()

    if license_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Clinic licence must be PDF, JPG, JPEG, or PNG",
        )

    upload_directory = os.path.join(
        "uploads",
        "doctors",
        str(doctor_id),
    )

    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    medical_filename = (
        f"medical_certificate_"
        f"{uuid.uuid4().hex}"
        f"{medical_extension}"
    )

    license_filename = (
        f"clinic_license_"
        f"{uuid.uuid4().hex}"
        f"{license_extension}"
    )

    medical_path = os.path.join(
        upload_directory,
        medical_filename,
    )

    license_path = os.path.join(
        upload_directory,
        license_filename,
    )

    with open(
        medical_path,
        "wb",
    ) as file:
        file.write(
            await medical_certificate.read()
        )

    with open(
        license_path,
        "wb",
    ) as file:
        file.write(
            await clinic_license.read()
        )

    verification.medical_certificate = medical_path
    verification.clinic_license = license_path
    verification.verification_status = "pending"

    db.commit()
    db.refresh(verification)

    return {
        "message": "Documents uploaded successfully",
        "doctor_id": doctor_id,
        "verification_status": verification.verification_status,
        "medical_certificate": medical_path,
        "clinic_license": license_path,
    }


# ==========================================================
# Dummy Doctor Approval
# ==========================================================

@router.post("/{doctor_id}/approve")
def approve_doctor(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    doctor = (
        db.query(User)
        .filter(
            User.id == doctor_id,
            User.role == "doctor",
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    verification = (
        db.query(DoctorVerification)
        .filter(
            DoctorVerification.doctor_id == doctor_id
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=404,
            detail="Doctor verification record not found",
        )

    # Dummy approval — no real license verification is performed.
    verification.verification_status = "approved"

    db.commit()
    db.refresh(verification)

    return {
        "message": "Doctor profile approved successfully",
        "doctor_id": doctor_id,
        "verification_status": verification.verification_status,
    }


# ==========================================================
# Doctor Verification Status
# ==========================================================

@router.get("/verification-status")
def get_doctor_verification_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    verification = (
        db.query(DoctorVerification)
        .filter(
            DoctorVerification.doctor_id == current_user.id
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=404,
            detail="Doctor verification record not found",
        )

    return {
        "doctor_id": current_user.id,
        "verification_status": verification.verification_status,
        "medical_certificate_uploaded": (
            verification.medical_certificate is not None
        ),
        "clinic_license_uploaded": (
            verification.clinic_license is not None
        ),
    }


# ==========================================================
# Doctor Patient
# ==========================================================

@router.get("/patient")
def get_doctor_patient(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    doctor_patient = (
        db.query(DoctorPatient)
        .filter(
            DoctorPatient.doctor_id == current_user.id,
            DoctorPatient.status == "active",
        )
        .order_by(
            DoctorPatient.created_at.desc()
        )
        .first()
    )

    if not doctor_patient:
        return None

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == doctor_patient.patient_id
        )
        .first()
    )

    if not patient:
        return None

    return {
        "id": patient.id,
        "full_name": patient.full_name,
        "age": patient.age,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "address": patient.address,

        "medical_conditions": patient.medical_conditions,
        "allergies": patient.allergies,
        "medications": patient.medications,

        "height_cm": patient.height_cm,
        "weight_kg": patient.weight_kg,
        "bmi": patient.bmi,

        "last_heart_rate": patient.last_heart_rate,
        "last_systolic_bp": patient.last_systolic_bp,
        "last_diastolic_bp": patient.last_diastolic_bp,
        "last_spo2": patient.last_spo2,
        "last_temperature": patient.last_temperature,
        "last_respiratory_rate": patient.last_respiratory_rate,

        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "relationship": patient.relationship,

        "assigned_caregiver": patient.assigned_caregiver,
        "hospital": patient.hospital,
        "doctor_phone": patient.doctor_phone,

        "notes": patient.notes,
    }


# ==========================================================
# Update Assigned Patient Notes
# ==========================================================

@router.patch("/patient/notes")
def update_doctor_patient_notes(
    request: PatientNotesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.doctor_id == current_user.id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="No patient is assigned to this doctor",
        )

    patient.notes = request.notes.strip() if request.notes else None

    db.commit()
    db.refresh(patient)

    return {"notes": patient.notes}


# ==========================================================
# Record Blood Pressure for Assigned Patient
# ==========================================================

@router.post("/patient/blood-pressure")
def record_doctor_blood_pressure(
    request: DoctorBloodPressureCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    doctor_patient = (
        db.query(DoctorPatient)
        .filter(
            DoctorPatient.doctor_id == current_user.id,
            DoctorPatient.status == "active",
        )
        .order_by(DoctorPatient.created_at.desc())
        .first()
    )

    if not doctor_patient:
        raise HTTPException(
            status_code=404,
            detail="No patient is assigned to this doctor",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.id == doctor_patient.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found",
        )

    # Create a new shared vital snapshot. Copying the prior non-BP values
    # prevents the doctor's BP entry from replacing the rest of the latest
    # family/caregiver vital display with blank values.
    latest_vital = (
        db.query(VitalLog)
        .filter(VitalLog.patient_id == patient.id)
        .order_by(VitalLog.created_at.desc(), VitalLog.id.desc())
        .first()
    )

    vital = VitalLog(
        patient_id=patient.id,
        heart_rate=latest_vital.heart_rate if latest_vital else None,
        systolic_bp=request.systolic_bp,
        diastolic_bp=request.diastolic_bp,
        spo2=latest_vital.spo2 if latest_vital else None,
        temperature=latest_vital.temperature if latest_vital else None,
        respiratory_rate=(
            latest_vital.respiratory_rate if latest_vital else None
        ),
        sleep_hours=latest_vital.sleep_hours if latest_vital else None,
        activity_steps=latest_vital.activity_steps if latest_vital else None,
    )

    patient.last_systolic_bp = request.systolic_bp
    patient.last_diastolic_bp = request.diastolic_bp

    db.add(vital)
    db.commit()
    db.refresh(vital)

    return vital


# ==========================================================
# Doctor Consultations
# ==========================================================


@router.post(
    "/consultations",
    response_model=ConsultationResponse,
)
def create_consultation(
    request: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == request.patient_id,
            Patient.doctor_id == current_user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient is not assigned to this doctor",
        )

    consultation = Consultation(
        patient_id=patient.id,
        doctor_id=current_user.id,
        reason=request.reason,
        scheduled_date=request.scheduled_date,
        scheduled_time=request.scheduled_time,
        status="scheduled",
    )

    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    return consultation


# ==========================================================
# Get Doctor Consultations
# ==========================================================


@router.get(
    "/consultations",
    response_model=list[ConsultationResponse],
)
def get_doctor_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id == current_user.id
        )
        .order_by(
            Consultation.scheduled_date.asc(),
            Consultation.scheduled_time.asc(),
        )
        .all()
    )

    return consultations


# ==========================================================
# Get Today's Consultations
# ==========================================================


@router.get(
    "/consultations/today",
    response_model=list[ConsultationResponse],
)
def get_today_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    from datetime import date

    today = date.today()

    consultations = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id == current_user.id,
            Consultation.scheduled_date == today,
        )
        .order_by(
            Consultation.scheduled_time.asc()
        )
        .all()
    )

    return consultations


# ==========================================================
# Start Consultation
# ==========================================================


@router.post(
    "/consultations/{consultation_id}/start",
    response_model=ConsultationResponse,
)
def start_consultation(
    consultation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id,
            Consultation.doctor_id == current_user.id,
        )
        .first()
    )

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    if consultation.status in {
        "completed",
        "cancelled",
    }:
        raise HTTPException(
            status_code=400,
            detail="This consultation cannot be started",
        )

    from datetime import datetime, timezone

    consultation.status = "in_progress"
    consultation.started_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(consultation)

    return consultation


# ==========================================================
# Update Consultation Notes
# ==========================================================


@router.patch(
    "/consultations/{consultation_id}/notes",
    response_model=ConsultationResponse,
)
def update_consultation_notes(
    consultation_id: int,
    request: ConsultationNotesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id,
            Consultation.doctor_id == current_user.id,
        )
        .first()
    )

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    consultation.consultation_notes = (
        request.consultation_notes
    )

    db.commit()
    db.refresh(consultation)

    return consultation


# ==========================================================
# Update Consultation Status
# ==========================================================


@router.patch(
    "/consultations/{consultation_id}/status",
    response_model=ConsultationResponse,
)
def update_consultation_status(
    consultation_id: int,
    request: ConsultationStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    allowed_statuses = {
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
    }

    if request.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid consultation status. "
                "Allowed values: scheduled, "
                "in_progress, completed, cancelled"
            ),
        )

    consultation = (
        db.query(Consultation)
        .filter(
            Consultation.id == consultation_id,
            Consultation.doctor_id == current_user.id,
        )
        .first()
    )

    if not consultation:
        raise HTTPException(
            status_code=404,
            detail="Consultation not found",
        )

    from datetime import datetime, timezone

    consultation.status = request.status

    if request.status == "in_progress":
        consultation.started_at = datetime.now(timezone.utc)

    elif request.status == "completed":
        consultation.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(consultation)

    return consultation


# ==========================================================
# DOCTOR PROFILE
# ==========================================================

@router.post(
    "/profile",
    response_model=DoctorProfileResponse,
)
def create_or_update_doctor_profile(
    profile_data: DoctorProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can manage doctor profiles",
        )

    profile = (
        db.query(DoctorProfile)
        .filter(DoctorProfile.doctor_id == current_user.id)
        .first()
    )

    if profile:
        profile.specialization = profile_data.specialization
        profile.clinic_name = profile_data.clinic_name
        profile.clinic_address = profile_data.clinic_address
        profile.experience_years = profile_data.experience_years
        profile.bio = profile_data.bio
    else:
        profile = DoctorProfile(
            doctor_id=current_user.id,
            specialization=profile_data.specialization,
            clinic_name=profile_data.clinic_name,
            clinic_address=profile_data.clinic_address,
            experience_years=profile_data.experience_years,
            bio=profile_data.bio,
        )

        db.add(profile)

    db.commit()
    db.refresh(profile)

    verification = (
        db.query(DoctorVerification)
        .filter(DoctorVerification.doctor_id == current_user.id)
        .first()
    )

    verification_status = (
        verification.verification_status
        if verification
        else "pending"
    )

    return DoctorProfileResponse(
        doctor_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        specialization=profile.specialization,
        clinic_name=profile.clinic_name,
        clinic_address=profile.clinic_address,
        experience_years=profile.experience_years,
        bio=profile.bio,
        verification_status=verification_status,
    )


@router.get(
    "/profile",
    response_model=DoctorProfileResponse,
)
def get_my_doctor_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Only doctors can access this profile",
        )

    profile = (
        db.query(DoctorProfile)
        .filter(DoctorProfile.doctor_id == current_user.id)
        .first()
    )

    verification = (
        db.query(DoctorVerification)
        .filter(DoctorVerification.doctor_id == current_user.id)
        .first()
    )

    return DoctorProfileResponse(
        doctor_id=current_user.id,
        full_name=current_user.full_name,
        email=current_user.email,
        phone=current_user.phone,
        specialization=profile.specialization if profile else None,
        clinic_name=profile.clinic_name if profile else None,
        clinic_address=profile.clinic_address if profile else None,
        experience_years=profile.experience_years if profile else None,
        bio=profile.bio if profile else None,
        verification_status=(
            verification.verification_status
            if verification
            else "pending"
        ),
    )


# ==========================================================
# FAMILY - VERIFIED DOCTOR DIRECTORY
# ==========================================================

@router.get(
    "/doctors",
    response_model=list[DoctorProfileResponse],
)
def get_verified_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["family", "caregiver"]:
        raise HTTPException(
            status_code=403,
            detail="Only family members and caregivers can view doctors",
        )

    doctors = (
        db.query(User)
        .join(
            DoctorVerification,
            DoctorVerification.doctor_id == User.id,
        )
        .outerjoin(
            DoctorProfile,
            DoctorProfile.doctor_id == User.id,
        )
        .filter(
            User.role == "doctor",
            DoctorVerification.verification_status == "approved",
        )
        .all()
    )

    result = []

    for doctor in doctors:
        profile = (
            db.query(DoctorProfile)
            .filter(DoctorProfile.doctor_id == doctor.id)
            .first()
        )

        verification = (
            db.query(DoctorVerification)
            .filter(DoctorVerification.doctor_id == doctor.id)
            .first()
        )

        result.append(
            DoctorProfileResponse(
                doctor_id=doctor.id,
                full_name=doctor.full_name,
                email=doctor.email,
                phone=doctor.phone,
                specialization=(
                    profile.specialization if profile else None
                ),
                clinic_name=(
                    profile.clinic_name if profile else None
                ),
                clinic_address=(
                    profile.clinic_address if profile else None
                ),
                experience_years=(
                    profile.experience_years if profile else None
                ),
                bio=profile.bio if profile else None,
                verification_status=(
                    verification.verification_status
                    if verification
                    else "pending"
                ),
            )
        )

    return result


# ==========================================================
# FAMILY - GET SINGLE DOCTOR PROFILE
# ==========================================================

@router.get(
    "/{doctor_id}/profile",
    response_model=DoctorProfileResponse,
)
def get_doctor_profile(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in ["family", "caregiver"]:
        raise HTTPException(
            status_code=403,
            detail="Only family members and caregivers can view doctor profiles",
        )

    doctor = (
        db.query(User)
        .filter(
            User.id == doctor_id,
            User.role == "doctor",
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    verification = (
        db.query(DoctorVerification)
        .filter(
            DoctorVerification.doctor_id == doctor_id,
            DoctorVerification.verification_status == "approved",
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=404,
            detail="Doctor is not approved",
        )

    profile = (
        db.query(DoctorProfile)
        .filter(
            DoctorProfile.doctor_id == doctor_id
        )
        .first()
    )

    return DoctorProfileResponse(
        doctor_id=doctor.id,
        full_name=doctor.full_name,
        email=doctor.email,
        phone=doctor.phone,
        specialization=(
            profile.specialization if profile else None
        ),
        clinic_name=(
            profile.clinic_name if profile else None
        ),
        clinic_address=(
            profile.clinic_address if profile else None
        ),
        experience_years=(
            profile.experience_years if profile else None
        ),
        bio=profile.bio if profile else None,
        verification_status=verification.verification_status,
    )


# ==========================================================
# FAMILY - BOOK CONSULTATION
# ==========================================================

@router.post(
    "/consultations/book",
    response_model=ConsultationResponse,
)
def book_consultation(
    request: FamilyConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can book consultations",
        )

    # ------------------------------------------------------
    # Verify doctor
    # ------------------------------------------------------

    doctor = (
        db.query(User)
        .filter(
            User.id == request.doctor_id,
            User.role == "doctor",
        )
        .first()
    )

    if not doctor:
        raise HTTPException(
            status_code=404,
            detail="Doctor not found",
        )

    verification = (
        db.query(DoctorVerification)
        .filter(
            DoctorVerification.doctor_id == request.doctor_id,
            DoctorVerification.verification_status == "approved",
        )
        .first()
    )

    if not verification:
        raise HTTPException(
            status_code=400,
            detail="Doctor is not approved",
        )

    # ------------------------------------------------------
    # Verify patient belongs to this family member
    # ------------------------------------------------------

    patient = (
        db.query(Patient)
        .filter(
            Patient.id == request.patient_id,
            Patient.user_id == current_user.id,
        )
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found for this family member",
        )

    # ------------------------------------------------------
    # Prevent booking in the past
    # ------------------------------------------------------

    from datetime import datetime

    requested_datetime = datetime.combine(
        request.scheduled_date,
        request.scheduled_time,
    )

    if requested_datetime < datetime.now():
        raise HTTPException(
            status_code=400,
            detail="Cannot book a consultation in the past",
        )

    # ------------------------------------------------------
    # Prevent double booking
    # ------------------------------------------------------

    existing_consultation = (
        db.query(Consultation)
        .filter(
            Consultation.doctor_id == request.doctor_id,
            Consultation.scheduled_date == request.scheduled_date,
            Consultation.scheduled_time == request.scheduled_time,
            Consultation.status.in_(
                ["scheduled", "in_progress"]
            ),
        )
        .first()
    )

    if existing_consultation:
        raise HTTPException(
            status_code=409,
            detail="This time slot is already booked",
        )

    # ------------------------------------------------------
    # Create consultation
    # ------------------------------------------------------

    consultation = Consultation(
        patient_id=patient.id,
        doctor_id=doctor.id,
        reason=request.reason,
        scheduled_date=request.scheduled_date,
        scheduled_time=request.scheduled_time,
        status="scheduled",
    )

    db.add(consultation)

    # ------------------------------------------------------
    # Create Doctor ↔ Patient relationship
    # ------------------------------------------------------

    doctor_patient = (
        db.query(DoctorPatient)
        .filter(
            DoctorPatient.doctor_id == doctor.id,
            DoctorPatient.patient_id == patient.id,
        )
        .first()
    )

    if doctor_patient is None:
        doctor_patient = DoctorPatient(
            doctor_id=doctor.id,
            patient_id=patient.id,
            status="active",
        )

        db.add(doctor_patient)

    else:
        doctor_patient.status = "active"

    db.commit()
    db.refresh(consultation)

    return consultation


# ==========================================================
# FAMILY - GET MY CONSULTATIONS
# ==========================================================

@router.get(
    "/consultations/my",
    response_model=list[ConsultationResponse],
)
def get_family_consultations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can view their consultations",
        )

    consultations = (
        db.query(Consultation)
        .join(
            Patient,
            Patient.id == Consultation.patient_id,
        )
        .filter(
            Patient.user_id == current_user.id,
        )
        .order_by(
            Consultation.scheduled_date.asc(),
            Consultation.scheduled_time.asc(),
        )
        .all()
    )

    return consultations
