from dotenv import load_dotenv
import os

from app.services.notification_service import notification_service


load_dotenv()


token = os.getenv("FCM_TEST_TOKEN")

if not token:
    raise RuntimeError(
        "FCM_TEST_TOKEN is missing from .env"
    )


success = notification_service.send_push_notification(
    token=token,
    title="ElderCare Test Notification",
    message="Firebase push notifications are working successfully.",
    data={
        "type": "test",
        "source": "eldercare",
    },
)


print()
print("=" * 60)
print(
    f"FCM TEST RESULT: "
    f"{'SUCCESS' if success else 'FAILED'}"
)
print("=" * 60)