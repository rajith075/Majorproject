# ElderlyCare Android app

This Flutter project is the native Android client for the existing FastAPI backend in `../backend`. Open **this `mobile/` directory** in Android Studio as a Flutter project. The Next.js frontend remains in `../frontend` for reference; the mobile app calls the same API and database.

## Run locally

1. Install Flutter and Android Studio with the Flutter and Dart plugins. Run `flutter doctor` and accept any Android SDK licenses.
2. Start PostgreSQL and the FastAPI backend from `backend/` with its required environment variables. For example: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
3. In Android Studio, select an Android emulator and run `lib/main.dart`. The default API address is `http://10.0.2.2:8000`, which reaches the development computer from an Android emulator.
4. For a physical Android phone on the same Wi-Fi, open **Server settings** on the sign-in screen and use `http://<computer-LAN-IP>:8000`. Ensure the computer firewall allows port 8000. The phone cannot reach the computer through `localhost` or `10.0.2.2`.

You can also supply a default address at build/run time:

```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8000
```

Release builds require HTTPS. Configure a private signing key before distribution, then build with your deployed API address:

```bash
flutter build apk --release --dart-define=API_BASE_URL=https://api.example.com
```

The app stores the JWT in Android secure storage. It allows plain HTTP only in debug builds to support local testing. No backend credentials or API keys are bundled into the app.

## Available workflows

- Family, caregiver, and doctor sign-in; role-based registration; doctor document upload and verification status
- Family patient setup and profile editing; caregiver assignment
- Latest vitals, manual family vital logging, doctor blood-pressure logging, and history
- AI assessment, history, recommendations, and clinical context for family/caregiver accounts
- Medication schedule, doctor prescriptions, and caregiver administration tracking
- Emergency alert history and confirmation
- Verified doctor directory, family appointment booking, doctor profile and consultation management
- Foreground device motion monitoring and SOS/fall alert submission with optional GPS location

## Integration notes

- The mobile app requires the existing FastAPI service and PostgreSQL database. ML, RAG, Twilio, and Arduino integrations stay on the server.
- Doctor verification approval remains a backend/admin action. The app can show status and upload documents.
- The current backend does not offer a user-device FCM token registration endpoint. Mobile push delivery needs that backend endpoint plus a Firebase Android configuration (`google-services.json`) before it can be enabled.
- The backend's manual `/emergency/alerts` route saves SOS/fall alerts but does not trigger its Twilio/FCM escalation service. The app describes these events as recorded alerts; it does not claim that an emergency contact was notified.
- The fall rule is the same prototype threshold used by the web page. Monitoring only runs while the sensor screen is open. It is not a background emergency service or a medical-grade fall detector.
- Emergency and AI features should be tested against a safe development backend before real-world use.
