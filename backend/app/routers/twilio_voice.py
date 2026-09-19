from fastapi import APIRouter, Request
from fastapi.responses import Response
from xml.sax.saxutils import escape

router = APIRouter(
    prefix="/twilio",
    tags=["Twilio"]
)


@router.post("/voice")
async def twilio_voice(request: Request):

    message = request.query_params.get("message")

    if not message:
        message = (
            "ElderCare emergency alert. "
            "A critical health condition has been detected. "
            "Immediate medical attention may be required."
        )

    message = escape(str(message))

    twiml = f"""
<Response>
    <Say language="en-IN">
        {message}
    </Say>
</Response>
"""

    return Response(
        content=twiml.strip(),
        media_type="application/xml"
    )