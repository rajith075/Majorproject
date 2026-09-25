"""Focused regression test for the invitation-to-caregiver-link transaction."""

import os
import unittest

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret"
os.environ["GEMINI_API_KEY"] = "test-key"

from app.db.database import Base, SessionLocal, engine
from app.models.caregiver_invitation import CaregiverInvitation
from app.models.caregiver_patient import CaregiverPatient
from app.models.patient import Patient
from app.models.user import User
from app.schemas.auth import RegisterRequest
from app.services.auth_service import AuthService
from app.services.caregiver_invitation_service import CaregiverInvitationService


class CaregiverInvitationServiceTests(unittest.TestCase):
    def setUp(self):
        Base.metadata.create_all(engine)
        self.db = SessionLocal()
        self.family = User(
            full_name="Family Member",
            email="family@example.com",
            phone="1000000000",
            password="hashed-password",
            role="family",
        )
        self.db.add(self.family)
        self.db.flush()
        self.patient = Patient(
            user_id=self.family.id,
            full_name="Lakshmi Devi",
            age=70,
            gender="Female",
            blood_group="O+",
            phone="1000000001",
            address="Test address",
        )
        self.db.add(self.patient)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(engine)

    def test_accepting_an_invitation_creates_one_active_link(self):
        invitation, token = CaregiverInvitationService.create(
            self.db,
            self.patient,
            self.family,
            "caregiver@example.com",
            "Daughter",
            "Please help monitor Lakshmi.",
        )
        self.db.commit()

        caregiver = User(
            full_name="Ananya Shetty",
            email="caregiver@example.com",
            phone="1000000002",
            password="hashed-password",
            role="caregiver",
        )
        self.db.add(caregiver)
        self.db.commit()

        link = CaregiverInvitationService.accept(self.db, token, caregiver)

        self.assertEqual(link.status, "active")
        self.assertEqual(link.patient_id, self.patient.id)
        self.assertEqual(link.caregiver_id, caregiver.id)
        self.assertEqual(
            self.db.query(CaregiverPatient).filter_by(status="active").count(), 1
        )
        self.assertEqual(self.db.get(CaregiverInvitation, invitation.id).status, "accepted")

    def test_registering_from_an_invitation_creates_account_and_link(self):
        invitation, token = CaregiverInvitationService.create(
            self.db,
            self.patient,
            self.family,
            "ananya@example.com",
            "Daughter",
            None,
        )

        caregiver = AuthService.register(
            self.db,
            RegisterRequest(
                full_name="Ananya Shetty",
                email="ananya@example.com",
                phone="1000000002",
                password="secure-password",
                role="caregiver",
                invitation_token=token,
            ),
        )
        CaregiverInvitationService.accept(
            self.db,
            token,
            caregiver,
            commit=False,
        )
        self.db.commit()

        link = self.db.query(CaregiverPatient).one()
        self.assertEqual(caregiver.role, "caregiver")
        self.assertEqual(link.caregiver_id, caregiver.id)
        self.assertEqual(link.patient_id, self.patient.id)
        self.assertEqual(self.db.get(CaregiverInvitation, invitation.id).status, "accepted")


if __name__ == "__main__":
    unittest.main()
