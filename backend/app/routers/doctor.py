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
from app.models.doctor_verification import DoctorVerification
from app.schemas.auth import RegisterRequest
from app.schemas.doctor_verification import (
    DoctorRegisterRequest,
    DoctorRegistrationResponse,
)
from app.services.auth_service import AuthService


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
    # ------------------------------------------------------
    # Check existing email
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Check existing phone
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Create doctor account using existing AuthService
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Create pending verification record
    # ------------------------------------------------------

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
    # ------------------------------------------------------
    # Check doctor exists
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Find existing verification record
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Allowed file types
    # ------------------------------------------------------

    allowed_extensions = {
        ".pdf",
        ".jpg",
        ".jpeg",
        ".png",
    }

    # ------------------------------------------------------
    # Validate medical certificate
    # ------------------------------------------------------

    medical_extension = os.path.splitext(
        medical_certificate.filename or ""
    )[1].lower()

    if medical_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Medical certificate must be PDF, JPG, JPEG, or PNG",
        )

    # ------------------------------------------------------
    # Validate clinic licence
    # ------------------------------------------------------

    license_extension = os.path.splitext(
        clinic_license.filename or ""
    )[1].lower()

    if license_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Clinic licence must be PDF, JPG, JPEG, or PNG",
        )

    # ------------------------------------------------------
    # Create doctor upload directory
    # ------------------------------------------------------

    upload_directory = os.path.join(
        "uploads",
        "doctors",
        str(doctor_id),
    )

    os.makedirs(
        upload_directory,
        exist_ok=True,
    )

    # ------------------------------------------------------
    # Generate safe unique filenames
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Save medical certificate
    # ------------------------------------------------------

    with open(
        medical_path,
        "wb",
    ) as file:
        file.write(
            await medical_certificate.read()
        )

    # ------------------------------------------------------
    # Save clinic licence
    # ------------------------------------------------------

    with open(
        license_path,
        "wb",
    ) as file:
        file.write(
            await clinic_license.read()
        )

    # ------------------------------------------------------
    # Update verification record
    # ------------------------------------------------------

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
    # ------------------------------------------------------
    # Check doctor exists
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Find verification record
    # ------------------------------------------------------

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

    # ------------------------------------------------------
    # Dummy approval
    #
    # This is only a formal/demo approval.
    # No real license verification is performed.
    # ------------------------------------------------------

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
    # ------------------------------------------------------
    # Make sure logged-in user is a doctor
    # ------------------------------------------------------

    if current_user.role != "doctor":
        raise HTTPException(
            status_code=403,
            detail="Doctor access required",
        )

    # ------------------------------------------------------
    # Find verification record
    # ------------------------------------------------------

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