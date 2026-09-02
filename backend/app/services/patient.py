from sqlalchemy.orm import Session

from app.models.patient import Patient
from app.models.user import User
from app.models.medication import Medication
from app.schemas.patient import PatientCreate


class PatientService:

    # ==========================================================
    # Create Patient
    # ==========================================================

    @staticmethod
    def create_patient(
        db: Session,
        user_id: int,
        request: PatientCreate,
    ):

        existing = (
            db.query(Patient)
            .filter(Patient.user_id == user_id)
            .first()
        )

        if existing:
            return None

        patient = Patient(

            # ==========================================
            # User
            # ==========================================

            user_id=user_id,

            # ==========================================
            # Basic Information
            # ==========================================

            full_name=request.full_name,
            age=request.age,
            gender=request.gender,
            blood_group=request.blood_group,
            ethnicity=request.ethnicity,

            phone=request.phone,
            address=request.address,

            # ==========================================
            # Physical Information
            # ==========================================

            height_cm=request.height_cm,
            weight_kg=request.weight_kg,
            bmi=request.bmi,

            # ==========================================
            # Lifestyle
            # ==========================================

            smoking=request.smoking,
            alcohol=request.alcohol,
            exercise_level=request.exercise_level,
            diet_quality=request.diet_quality,
            water_intake_liters=request.water_intake_liters,
            medication_adherence=request.medication_adherence,

            mobility=request.mobility,
            memory_status=request.memory_status,

            # ==========================================
            # Baseline Vitals
            # ==========================================

            baseline_heart_rate=request.baseline_heart_rate,
            baseline_systolic_bp=request.baseline_systolic_bp,
            baseline_diastolic_bp=request.baseline_diastolic_bp,
            baseline_spo2=request.baseline_spo2,
            baseline_temperature=request.baseline_temperature,
            baseline_respiratory_rate=request.baseline_respiratory_rate,

            # ==========================================
            # Medical Information
            # ==========================================

            medical_conditions=request.medical_conditions,
            allergies=request.allergies,
            medications=request.medications,

            # ==========================================
            # Emergency Contact
            # ==========================================

            emergency_contact_name=request.emergency_contact_name,
            emergency_contact_phone=request.emergency_contact_phone,
            relationship=request.relationship,
            secondary_contact=request.secondary_contact,

            # ==========================================
            # Care Team
            # ==========================================

            assigned_doctor=request.assigned_doctor,
            assigned_caregiver=request.assigned_caregiver,
            hospital=request.hospital,
            doctor_phone=request.doctor_phone,

            # caregiver_id remains NULL initially
            # It will be assigned separately after
            # the son selects a virtual caregiver.

            # ==========================================
            # Notes
            # ==========================================

            notes=request.notes,
        )

        db.add(patient)
        db.commit()
        db.refresh(patient)

        # ==========================================================
        # CREATE INITIAL MEDICATION RECORDS
        # ==========================================================

        if request.medications:
            medication_names = [
                medicine.strip()
                for medicine in request.medications.split(",")
                if medicine.strip()
            ]

            for medicine_name in medication_names:
                medication = Medication(
                    patient_id=patient.id,
                    medicine_name=medicine_name,
                    active=True,
                )

                db.add(medication)

            db.commit()

        return patient

    # ==========================================================
    # Get Patient
    # ==========================================================

    @staticmethod
    def get_patient(
        db: Session,
        user_id: int,
    ):

        return (
            db.query(Patient)
            .filter(Patient.user_id == user_id)
            .first()
        )

    # ==========================================================
    # Update Patient
    # ==========================================================

    @staticmethod
    def update_patient(
        db: Session,
        user_id: int,
        request: PatientCreate,
    ):

        patient = (
            db.query(Patient)
            .filter(Patient.user_id == user_id)
            .first()
        )

        if not patient:
            return None

        # ==========================================
        # Basic Information
        # ==========================================

        patient.full_name = request.full_name
        patient.age = request.age
        patient.gender = request.gender
        patient.blood_group = request.blood_group
        patient.ethnicity = request.ethnicity

        patient.phone = request.phone
        patient.address = request.address

        # ==========================================
        # Physical Information
        # ==========================================

        patient.height_cm = request.height_cm
        patient.weight_kg = request.weight_kg
        patient.bmi = request.bmi

        # ==========================================
        # Lifestyle
        # ==========================================

        patient.smoking = request.smoking
        patient.alcohol = request.alcohol
        patient.exercise_level = request.exercise_level
        patient.diet_quality = request.diet_quality
        patient.water_intake_liters = request.water_intake_liters
        patient.medication_adherence = request.medication_adherence

        patient.mobility = request.mobility
        patient.memory_status = request.memory_status

        # ==========================================
        # Baseline Vitals
        # ==========================================

        patient.baseline_heart_rate = request.baseline_heart_rate
        patient.baseline_systolic_bp = request.baseline_systolic_bp
        patient.baseline_diastolic_bp = request.baseline_diastolic_bp
        patient.baseline_spo2 = request.baseline_spo2
        patient.baseline_temperature = request.baseline_temperature
        patient.baseline_respiratory_rate = request.baseline_respiratory_rate

        # ==========================================
        # Medical Information
        # ==========================================

        patient.medical_conditions = request.medical_conditions
        patient.allergies = request.allergies
        patient.medications = request.medications

        # ==========================================
        # Emergency Contact
        # ==========================================

        patient.emergency_contact_name = request.emergency_contact_name
        patient.emergency_contact_phone = request.emergency_contact_phone
        patient.relationship = request.relationship
        patient.secondary_contact = request.secondary_contact

        # ==========================================
        # Care Team
        # ==========================================

        patient.assigned_doctor = request.assigned_doctor
        patient.assigned_caregiver = request.assigned_caregiver
        patient.hospital = request.hospital
        patient.doctor_phone = request.doctor_phone

        # ==========================================
        # Notes
        # ==========================================

        patient.notes = request.notes

        db.commit()
        db.refresh(patient)

        return patient

    # ==========================================================
    # Get Available Virtual Caregivers
    # ==========================================================

    @staticmethod
    def get_available_caregivers(
        db: Session,
    ):

        return (
            db.query(User)
            .filter(
                User.role == "caregiver",
                User.is_active == True,
            )
            .all()
        )

    # ==========================================================
    # Assign Caregiver
    # ==========================================================

    @staticmethod
    def assign_caregiver(
        db: Session,
        user_id: int,
        caregiver_id: int,
    ):

        # ------------------------------------------
        # Find patient's profile
        # ------------------------------------------

        patient = (
            db.query(Patient)
            .filter(
                Patient.user_id == user_id
            )
            .first()
        )

        if not patient:
            return None, "Patient profile not found."

        # ------------------------------------------
        # Verify caregiver exists
        # ------------------------------------------

        caregiver = (
            db.query(User)
            .filter(
                User.id == caregiver_id,
                User.role == "caregiver",
                User.is_active == True,
            )
            .first()
        )

        if not caregiver:
            return None, "Caregiver not found."

        # ------------------------------------------
        # Assign caregiver
        # ------------------------------------------

        patient.caregiver_id = caregiver.id

        # Keep old field synchronized
        patient.assigned_caregiver = caregiver.full_name

        db.commit()
        db.refresh(patient)

        return patient, None