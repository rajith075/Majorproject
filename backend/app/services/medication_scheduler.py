try:
    from apscheduler.schedulers.background import BackgroundScheduler
except ImportError:
    BackgroundScheduler = None

from app.db.database import SessionLocal
from app.services.medication_reminder_service import medication_reminder_service


scheduler = BackgroundScheduler() if BackgroundScheduler else None


def dispatch_medication_reminders() -> None:
    db = SessionLocal()
    try:
        medication_reminder_service.dispatch_due_reminders(db)
    except Exception as error:
        db.rollback()
        print(f"[MEDICATION REMINDERS] Dispatch failed: {error}")
    finally:
        db.close()


def start_medication_scheduler() -> None:
    if scheduler is None:
        print(
            "[MEDICATION REMINDERS] Scheduler disabled: install APScheduler "
            "to enable automatic reminders."
        )
        return

    if scheduler.running:
        return
    scheduler.add_job(
        dispatch_medication_reminders,
        trigger="interval",
        seconds=30,
        id="medication-reminders",
        replace_existing=True,
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()


def stop_medication_scheduler() -> None:
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
