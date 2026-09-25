import smtplib
from email.message import EmailMessage

from app.core.config import settings


class EmailDeliveryError(Exception):
    pass


class EmailService:
    @staticmethod
    def send_caregiver_invitation(
        recipient_email: str,
        family_name: str,
        patient_name: str,
        relationship: str,
        invitation_url: str,
        message: str | None,
    ) -> None:
        if not settings.SMTP_HOST or not settings.SMTP_FROM_EMAIL:
            raise EmailDeliveryError(
                "Email delivery is not configured. Set SMTP_HOST and SMTP_FROM_EMAIL."
            )

        email = EmailMessage()
        email["Subject"] = "You're invited to ElderCare"
        email["From"] = settings.SMTP_FROM_EMAIL
        email["To"] = recipient_email

        personal_message = f"\n\nMessage from {family_name}: {message}" if message else ""
        email.set_content(
            f"{family_name} has invited you to become a {relationship} for "
            f"{patient_name} in ElderCare.{personal_message}\n\n"
            f"Accept invitation: {invitation_url}\n\n"
            "This invitation expires in 7 days."
        )

        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as client:
                if settings.SMTP_USE_TLS:
                    client.starttls()
                if settings.SMTP_USERNAME:
                    client.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                client.send_message(email)
        except (OSError, smtplib.SMTPException) as error:
            raise EmailDeliveryError("Unable to deliver the caregiver invitation email.") from error
