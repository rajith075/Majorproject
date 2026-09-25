import os
import html

from dotenv import load_dotenv
from twilio.rest import Client

import firebase_admin
from firebase_admin import credentials, messaging


load_dotenv()


# =========================================================
# FIREBASE ADMIN INITIALIZATION
# =========================================================

def _initialize_firebase():

    try:
        # Firebase already initialized
        firebase_admin.get_app()
        print("[FCM] Firebase Admin already initialized.")
        return

    except ValueError:
        # No Firebase app exists yet
        pass

    credentials_path = os.getenv(
        "GOOGLE_APPLICATION_CREDENTIALS"
    )

    if not credentials_path:

        print(
            "[FCM] GOOGLE_APPLICATION_CREDENTIALS "
            "is missing."
        )

        return

    try:

        cred = credentials.Certificate(
            credentials_path
        )

        firebase_admin.initialize_app(
            cred
        )

        print(
            "[FCM] Firebase Admin initialized successfully."
        )

    except Exception as e:

        print("=" * 60)
        print("[FCM] FIREBASE ADMIN INITIALIZATION FAILED")
        print("=" * 60)
        print(str(e))
        print("=" * 60)


_initialize_firebase()


class NotificationService:

    def __init__(self):

        self.mode = os.getenv(
            "NOTIFICATION_MODE",
            "mock"
        ).strip().lower()

    # =========================================================
    # PHONE NORMALIZATION
    # =========================================================

    @staticmethod
    def normalize_phone(phone: str | None):

        if not phone:
            return None

        phone = str(phone).strip()

        if phone.startswith("whatsapp:"):

            phone = phone.replace(
                "whatsapp:",
                "",
                1
            )

        if phone.startswith("+"):
            return phone

        # Indian 10-digit number
        if len(phone) == 10 and phone.isdigit():

            return "+91" + phone

        # Indian number beginning with 91
        if len(phone) == 12 and phone.startswith("91"):

            return "+" + phone

        return phone

    # =========================================================
    # TEST PHONE
    # =========================================================

    def _get_test_phone(self):

        phone = os.getenv(
            "TEST_NOTIFICATION_PHONE"
        )

        if phone:

            return self.normalize_phone(
                phone
            )

        return None

    # =========================================================
    # TWILIO CLIENT
    # =========================================================

    def _get_twilio_client(self):

        account_sid = os.getenv(
            "TWILIO_ACCOUNT_SID"
        )

        auth_token = os.getenv(
            "TWILIO_AUTH_TOKEN"
        )

        if not account_sid or not auth_token:

            print(
                "[TWILIO] Missing TWILIO_ACCOUNT_SID "
                "or TWILIO_AUTH_TOKEN"
            )

            return None

        return Client(
            account_sid,
            auth_token
        )

    # =========================================================
    # WHATSAPP
    # =========================================================

    def send_whatsapp(
        self,
        phone: str,
        patient_id: int | str,
        event: str,
    ):

        phone = self.normalize_phone(
            phone
        )

        if not phone:

            print(
                "[WHATSAPP] Invalid recipient."
            )

            return False

        to_number = f"whatsapp:{phone}"

        from_number = os.getenv(
            "TWILIO_WHATSAPP_FROM"
        )

        content_sid = os.getenv(
            "TWILIO_WHATSAPP_CONTENT_SID"
        )

        if not from_number:

            print(
                "[WHATSAPP] Missing "
                "TWILIO_WHATSAPP_FROM"
            )

            return False

        if not content_sid:

            print(
                "[WHATSAPP] Missing "
                "TWILIO_WHATSAPP_CONTENT_SID"
            )

            return False

        # =====================================================
        # MOCK MODE
        # =====================================================

        if self.mode == "mock":

            print("=" * 60)
            print("MOCK WHATSAPP")
            print("=" * 60)

            print(
                f"To          : {to_number}"
            )

            print(
                f"From        : {from_number}"
            )

            print(
                f"Content SID : {content_sid}"
            )

            print(
                f"Patient     : {patient_id}"
            )

            print(
                f"Event       : {event}"
            )

            print("=" * 60)

            return True

        # =====================================================
        # REAL TWILIO
        # =====================================================

        try:

            client = self._get_twilio_client()

            if client is None:
                return False

            content_variables = {
                "1": f"Patient ID {patient_id}",
                "2": str(event),
            }

            message = client.messages.create(

                from_=(
                    from_number
                    if from_number.startswith(
                        "whatsapp:"
                    )
                    else f"whatsapp:{from_number}"
                ),

                to=to_number,

                content_sid=content_sid,

                content_variables=str(
                    content_variables
                ).replace("'", '"'),
            )

            print("=" * 60)
            print("TWILIO WHATSAPP SENT")
            print("=" * 60)

            print(
                f"SID         : {message.sid}"
            )

            print(
                f"To          : {to_number}"
            )

            print(
                f"Patient     : {patient_id}"
            )

            print(
                f"Event       : {event}"
            )

            print("=" * 60)

            return True

        except Exception as e:

            print("=" * 60)
            print("TWILIO WHATSAPP FAILED")
            print("=" * 60)

            print(str(e))

            print("=" * 60)

            return False

    # =========================================================
    # SMS
    # =========================================================

    def send_sms(
        self,
        phone: str,
        message: str
    ):

        phone = self.normalize_phone(
            phone
        )

        if not phone:

            print(
                "[SMS] Invalid recipient."
            )

            return False

        if self.mode == "mock":

            print("=" * 60)
            print("MOCK SMS")
            print("=" * 60)

            print(
                f"To      : {phone}"
            )

            print(
                f"Message : {message}"
            )

            print("=" * 60)

            return True

        print(
            "[SMS] Real SMS disabled for current "
            "Twilio WhatsApp demo."
        )

        return False

    # =========================================================
    # FIREBASE PUSH NOTIFICATION
    # =========================================================

    def send_push_notification(
        self,
        token: str,
        title: str,
        message: str,
        data: dict | None = None,
        urgent: bool = False,
    ):

        if not token:

            print(
                "[FCM] Missing FCM token."
            )

            return False

        try:

            # Firebase requires data values
            # to be strings.
            payload_data = {
                str(key): str(value)
                for key, value in (
                    data or {}
                ).items()
            }

            push_message = messaging.Message(

                notification=messaging.Notification(
                    title=title,
                    body=message,
                ),

                data=payload_data,

                # Web Push defaults can be deferred by a browser. Emergency
                # alerts are explicitly high-urgency and short-lived.
                webpush=messaging.WebpushConfig(
                    headers={
                        "Urgency": "high" if urgent else "normal",
                        "TTL": "60" if urgent else "3600",
                    },
                    notification=messaging.WebpushNotification(
                        require_interaction=urgent,
                    ),
                ),

                token=token,
            )

            response = messaging.send(
                push_message
            )

            print("=" * 60)
            print("FCM PUSH SENT")
            print("=" * 60)

            print(
                f"Message ID : {response}"
            )

            print(
                f"Title      : {title}"
            )

            print(
                f"Message    : {message}"
            )

            print("=" * 60)

            return True

        except Exception as e:

            print("=" * 60)
            print("FCM PUSH FAILED")
            print("=" * 60)

            print(str(e))

            print("=" * 60)

            return False

    # =========================================================
    # VOICE CALL
    # =========================================================

    def make_call(
        self,
        phone: str,
        message: str
    ):

        phone = self.normalize_phone(
            phone
        )

        if not phone:

            print(
                "[CALL] Invalid recipient."
            )

            return False

        # =====================================================
        # MOCK MODE
        # =====================================================

        if self.mode == "mock":

            print("=" * 60)
            print("MOCK CALL")
            print("=" * 60)

            print(
                f"To      : {phone}"
            )

            print(
                f"Message : {message}"
            )

            print("=" * 60)

            return True

        # =====================================================
        # REAL TWILIO TRIAL CALL
        # =====================================================

        try:

            client = self._get_twilio_client()

            if client is None:
                return False

            from_number = os.getenv(
                "TWILIO_PHONE_NUMBER"
            )

            if not from_number:

                print(
                    "[CALL] Missing "
                    "TWILIO_PHONE_NUMBER"
                )

                return False

            # =================================================
            # Twilio Trial Voice
            #
            # Trial accounts restrict custom twiml
            # and custom webhook parameters.
            #
            # Use Twilio's predefined Voice TTS template.
            # =================================================

            trial_voice_url = (
                "https://webhooks.twilio.com/"
                "v1/Voice/Template/"
                "voice_text_to_speech"
            )

            call = client.calls.create(
                to=phone,
                from_=from_number,
                url=trial_voice_url,
            )

            print("=" * 60)
            print("TWILIO CALL SENT")
            print("=" * 60)

            print(
                f"SID     : {call.sid}"
            )

            print(
                f"To      : {phone}"
            )

            print(
                f"Status  : {call.status}"
            )

            print("=" * 60)

            return True

        except Exception as e:

            print("=" * 60)
            print("TWILIO CALL FAILED")
            print("=" * 60)

            print(str(e))

            print("=" * 60)

            return False


# =========================================================
# SINGLE NOTIFICATION SERVICE INSTANCE
# =========================================================

notification_service = NotificationService()
