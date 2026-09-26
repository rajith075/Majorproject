import secrets
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.database import get_db
from app.models.device_connection import DeviceConnection
from app.models.patient import Patient
from app.models.user import User
from app.models.vital_log import VitalLog
from app.schemas.vital_log import VitalLogCreate, VitalLogResponse
from app.services.emergency_notification_service import (
    emergency_notification_service,
)
from app.services.vital_log_service import vital_log_service


router = APIRouter(
    prefix="/devices",
    tags=["Devices"],
)


class DeviceVitalIngestResponse(BaseModel):
    """Result of a vital reading submitted by an authenticated device."""

    success: bool
    patient_id: int
    patient_name: str
    device_status: str
    vital: VitalLogResponse


@router.post("/connect")
def connect_device(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can connect a device.",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.user_id == current_user.id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient profile not found.",
        )

    existing_connections = (
        db.query(DeviceConnection)
        .filter(
            DeviceConnection.user_id == current_user.id,
            DeviceConnection.status == "connected",
        )
        .all()
    )

    for connection in existing_connections:
        connection.status = "disconnected"

    device_token = secrets.token_urlsafe(48)

    connection = DeviceConnection(
        patient_id=patient.id,
        user_id=current_user.id,
        device_name="Arduino UNO",
        device_token=device_token,
        status="connected",
        connected_at=datetime.now(timezone.utc),
        last_seen_at=None,
    )

    db.add(connection)
    db.commit()
    db.refresh(connection)

    return {
        "success": True,
        "connection_id": connection.id,
        "patient_id": patient.id,
        "patient_name": patient.full_name,
        "device_name": connection.device_name,
        "device_token": connection.device_token,
        "status": connection.status,
        "connected_at": connection.connected_at,
    }


@router.get("/connection")
def get_device_connection(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    response.headers["Cache-Control"] = "no-store"
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can access device connection.",
        )

    connection = (
        db.query(DeviceConnection)
        .filter(
            DeviceConnection.user_id == current_user.id,
            DeviceConnection.status == "connected",
        )
        .order_by(DeviceConnection.connected_at.desc())
        .first()
    )

    if not connection:
        return {
            "connected": False,
            "connection": None,
        }

    patient = (
        db.query(Patient)
        .filter(Patient.id == connection.patient_id)
        .first()
    )

    return {
        "connected": True,
        "connection": {
            "id": connection.id,
            "patient_id": connection.patient_id,
            "patient_name": patient.full_name if patient else None,
            "device_name": connection.device_name,
            "status": connection.status,
            "connected_at": connection.connected_at,
            "last_seen_at": connection.last_seen_at,
        },
    }


@router.post("/disconnect")
def disconnect_device(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "family":
        raise HTTPException(
            status_code=403,
            detail="Only family members can disconnect the device.",
        )

    connection = (
        db.query(DeviceConnection)
        .filter(
            DeviceConnection.user_id == current_user.id,
            DeviceConnection.status == "connected",
        )
        .order_by(DeviceConnection.connected_at.desc())
        .first()
    )

    if not connection:
        return {
            "success": True,
            "message": "No active device connection.",
        }

    connection.status = "disconnected"

    db.commit()

    return {
        "success": True,
        "message": "Arduino device disconnected.",
    }


@router.post(
    "/vitals",
    response_model=DeviceVitalIngestResponse,
    status_code=status.HTTP_201_CREATED,
)
def receive_device_vitals(
    data: VitalLogCreate,
    device_token: Annotated[str | None, Header(alias="X-Device-Token")] = None,
    db: Session = Depends(get_db),
):
    """Store a reading for the patient currently linked to this device.

    The bridge authenticates with the opaque token returned by ``/devices/connect``.
    The patient id is intentionally never accepted from the device, so a bridge
    cannot submit readings to a different patient's record.
    """
    if not device_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device token is required.",
        )

    connection = (
        db.query(DeviceConnection)
        .filter(
            DeviceConnection.device_token == device_token,
            DeviceConnection.status == "connected",
        )
        .first()
    )

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive device connection.",
        )

    patient = (
        db.query(Patient)
        .filter(Patient.id == connection.patient_id)
        .first()
    )

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connected patient not found.",
        )

    # VitalLogService commits this change together with the vital record and
    # patient snapshot, avoiding a false device heartbeat if saving the reading
    # fails.
    connection.last_seen_at = datetime.now(timezone.utc)
    vital, _ = vital_log_service.create_vital_log(
        db=db,
        patient=patient,
        data=data,
    )
    # Live device readings are monitoring-only. AI analysis is generated for
    # deliberate backend assessments, not every sensor sample, so an Arduino
    # streaming every few seconds cannot exhaust the Gemini quota.

    return {
        "success": True,
        "patient_id": patient.id,
        "patient_name": patient.full_name,
        "device_status": connection.status,
        "vital": vital,
    }


@router.post("/fall", status_code=status.HTTP_202_ACCEPTED)
def report_device_fall(
    background_tasks: BackgroundTasks,
    device_token: Annotated[str | None, Header(alias="X-Device-Token")] = None,
    db: Session = Depends(get_db),
):
    """Queue an emergency push notification and call for a detected fall."""
    if not device_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Device token is required.",
        )

    connection = (
        db.query(DeviceConnection)
        .filter(
            DeviceConnection.device_token == device_token,
            DeviceConnection.status == "connected",
        )
        .first()
    )
    if not connection:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or inactive device connection.",
        )

    patient = db.get(Patient, connection.patient_id)
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connected patient not found.",
        )

    latest_vital = (
        db.query(VitalLog)
        .filter(VitalLog.patient_id == patient.id)
        .order_by(VitalLog.created_at.desc(), VitalLog.id.desc())
        .first()
    )
    if not latest_vital:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A vital reading is required before reporting a fall.",
        )

    connection.last_seen_at = datetime.now(timezone.utc)
    db.commit()
    background_tasks.add_task(
        emergency_notification_service.process_fall_alert,
        patient.id,
        latest_vital.id,
    )

    return {
        "success": True,
        "message": "Fall alert queued for the care team.",
        "patient_id": patient.id,
    }
