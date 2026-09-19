import os
import json
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv()

client = Client(
    os.getenv("TWILIO_ACCOUNT_SID"),
    os.getenv("TWILIO_AUTH_TOKEN"),
)

message = client.messages.create(
    from_=os.getenv("TWILIO_WHATSAPP_FROM"),
    to="whatsapp:+917795935969",
    content_sid=os.getenv("TWILIO_WHATSAPP_CONTENT_SID"),
    content_variables=json.dumps({
        "1": "Patient ID 2",
        "2": "Hypertensive Crisis",
    }),
)

print("WhatsApp sent!")
print("SID:", message.sid)
print("Status:", message.status)