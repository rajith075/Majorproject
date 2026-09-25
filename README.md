ElderlyCare

AI-Powered Elderly Healthcare Monitoring and Predictive Care System

ElderlyCare is a full-stack healthcare monitoring platform for remotely monitoring elderly patients, coordinating family members, caregivers and doctors, managing medications, analyzing health risks, and responding to emergency conditions.

Status: Academic/major-project prototype. The web application, database-backed clinical workflows, AI/ML pipeline, notification system, and Arduino sensor prototype are under active development/integration.

Features

Role-based Family, Caregiver and Doctor dashboards

Patient profile and care-team management

Vital logging and historical health data

AI health-risk prediction

Clinical-event prediction

Explainable AI / SHAP components

Medical RAG with vector search and Gemini

Medication management and administration tracking

Doctor registration and verification

Doctor-patient relationships

Appointment/consultation workflow

Emergency alert persistence

Firebase Cloud Messaging (FCM) push notifications

Twilio voice escalation for critical alerts

Health reports and historical trends

IoT sensor prototype using Arduino UNO, MAX30102, MPU6050 and DHT11

System Architecture

                 Elderly Patient
                       |
             +---------+---------+
             |                   |
          IoT Data           Manual Data
             |                   |
             +---------+---------+
                       |
                       v
                 FastAPI Backend
                       |
          +------------+------------+
          |            |            |
          v            v            v
      PostgreSQL    AI/ML       Emergency
      Database     Pipeline      Engine
                       |            |
              +--------+--------+   +------+
              |                 |          |
              v                 v          v
        Health Risk       Clinical Event  FCM
         Prediction         Prediction      |
              |                 |           v
              +--------+--------+        Twilio
                       |
                       v
                 RAG / Gemini
                       |
                       v
              Role-based Dashboards

User Roles

Family

Family members remotely manage and monitor an elderly patient's care.

They can access patient information, vitals, AI health assessment, reports, medications, emergency alerts, doctors and appointment workflows.

Caregiver

A caregiver is the person assigned by the family to actively look after the elderly patient. This may be a trusted family member or another designated caregiver.

The caregiver dashboard focuses on:

Assigned patient monitoring

Current vitals

AI health assessment

Caregiver guidance

Medication information

Emergency alerts

Doctor

Doctors can:

Register and submit verification documents

Be approved through the verification workflow

Maintain a professional profile

Receive appointment requests

Access linked patients

Review vitals, medications and patient information

Review clinical/AI information

Manage consultations

Technology Stack

Frontend

Next.js

React

TypeScript

Tailwind CSS

shadcn/ui

Framer Motion

Lucide React

Axios

Zustand

React Hook Form

Sonner

Firebase Cloud Messaging

Backend

Python

FastAPI

SQLAlchemy

PostgreSQL

Pydantic

JWT authentication

Uvicorn

AI/ML

Python ML pipeline

Health-risk model

Clinical-event model

Feature and label encoders

SHAP explainability

Google Gemini

Retrieval-Augmented Generation (RAG)

Medical vector store

Notifications

Firebase Cloud Messaging

Twilio Voice

Hardware Prototype

Arduino UNO

MAX30102

MPU6050

DHT11

IoT Architecture

Arduino UNO
   |
   +-- MAX30102 --> Heart Rate + SpO2
   |
   +-- MPU6050  --> Motion / Fall Detection
   |
   +-- DHT11    --> Temperature

The existing VitalLog model stores:

heart_rate
systolic_bp
diastolic_bp
spo2
temperature
respiratory_rate
sleep_hours
activity_steps
created_at

The physical prototype does not directly measure every VitalLog field; values such as blood pressure, sleep and activity may come from other inputs.

Typical UNO wiring

MAX30102:
VIN  -> 3.3V
GND  -> GND
SDA  -> A4
SCL  -> A5

MPU6050:
VCC  -> 3.3V*
GND  -> GND
SDA  -> A4
SCL  -> A5

DHT11:
VCC  -> 5V
GND  -> GND
DATA -> D2

* Check the electrical specifications of the particular MPU6050 breakout board before powering it.

Arduino libraries

#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include "MAX30105.h"
#include "heartRate.h"

Install:

Adafruit MPU6050

Adafruit Unified Sensor

Adafruit BusIO

DHT sensor library

SparkFun MAX3010x Sensor Library

Wire.h is provided by the Arduino environment.

Vital Processing

A vital submission follows this architecture:

Vital Input
    |
    v
POST /vitals/{patient_id}
    |
    v
Save VitalLog
    |
    +--> Fast critical safety check
    |        |
    |        +--> FCM for critical condition
    |        +--> Twilio for critical condition
    |
    v
Existing AI prediction pipeline
    |
    +--> Health risk
    +--> Clinical event
    +--> Explainability
    +--> RAG / Gemini
    +--> Recommendations
    |
    v
Dashboard

The immediate safety layer is designed so a critical notification does not have to wait for slower ML/RAG/Gemini processing.

Emergency Notification Policy

Severity

Dashboard

FCM

Twilio

Normal

Yes

No

No

Moderate

Yes

No

No

High

Yes

Yes

No

Critical

Yes

Yes

Yes

The fast safety layer currently supports critical test conditions such as:

SpO2 below 85%

Heart rate below 40 or above 140 BPM

Systolic BP at or above 180 mmHg

Diastolic BP at or above 120 mmHg

Temperature at or above 40 C

Respiratory rate at or above 30/min

These are application safety rules for the prototype and are not medical diagnoses.

AI Pipeline

The patient profile service gathers:

Patient information

Patient conditions

Medications

Latest vital record

The prediction service then produces information such as:

Health-risk prediction

Confidence

Clinical-event prediction

Clinical-event confidence

Health assessment

Alerts

Recommendations

Representative model artifacts include:

backend/ml/models/
├── health_risk_model_v2.pkl
├── health_feature_columns_v2.pkl
├── health_feature_encoders.pkl
├── health_label_encoder.pkl
├── clinical_event_model_v2.pkl
├── clinical_event_feature_columns_v2.pkl
├── clinical_event_feature_encoders.pkl
└── clinical_event_label_encoder.pkl

Additional training, preprocessing, encoder and evaluation artifacts are stored under backend/ml.

Explainable AI

The project contains explainability components for:

Feature importance

SHAP explanations

AI-generated explanations

Caregiver guidance

Contextual medical information

The objective is to provide reasons and context alongside a prediction rather than displaying only a risk label.

Medical RAG

Medical knowledge retrieval is maintained separately from the predictive models.

Current vector-store assets include:

backend/data/vector_store/
├── medical.index
└── metadata.pkl

General flow:

Patient / Prediction Context
          |
          +--> ML Prediction
          |
          +--> Medical Retrieval
                    |
                    v
                  Gemini
                    |
                    v
            Contextual AI Output

AI output is decision support and does not replace professional diagnosis or treatment.

Doctor-Patient Relationship

The project uses a dedicated doctor_patients relationship table:

id
doctor_id
patient_id
status
created_at

A consultation request can create or reactivate the relationship between the selected doctor and patient.

This allows a doctor to access the patient through the doctor-patient relationship without replacing the application's existing primary patient assignment.

Doctor Verification

Doctor registration creates a pending verification record.

The verification workflow supports:

Medical certificate upload

Clinic license upload

Verification status

Approval

Verified-doctor directory

Only approved doctors are intended to participate in the family appointment workflow.

Medication

Medication is maintained as a centralized patient-care resource.

The system supports:

Medication records

Doctor access

Family visibility

Caregiver visibility

Medication status/history

Medication administration tracking

The design avoids creating separate medication systems for each role.

Authentication and Authorization

The application uses authenticated users and role-based authorization for:

family
caregiver
doctor

Backend routes use the authenticated user context to restrict patient and clinical data access.

The frontend uses a shared Axios API client for authenticated requests.

Project Structure

Frontend

frontend/
├── app/
├── components/
│   ├── dashboard/
│   ├── family/
│   ├── patient/
│   ├── layout/
│   └── ui/
├── constants/
├── lib/
├── providers/
├── services/
│   ├── api/
│   └── auth/
├── store/
└── public/
    ├── sounds/
    │   └── emergency-alert.mp3
    └── firebase-messaging-sw.js

Backend

backend/
├── app/
│   ├── ai/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── routers/
│   ├── schemas/
│   └── services/
├── data/
│   └── vector_store/
├── ml/
│   ├── configs/
│   ├── data/
│   ├── digital_twin/
│   ├── engines/
│   ├── generators/
│   ├── models/
│   ├── notebooks/
│   ├── reports/
│   └── utils/
└── venv/

Important Backend Components

vital_log_service.py

Handles:

Vital creation

Latest patient vital snapshot

Immediate emergency safety checks

Existing AI prediction pipeline

patient_profile_service.py

Builds the patient profile used by prediction from patient information, conditions, medications and latest vitals.

prediction_service.py

Coordinates the health-risk and clinical-event prediction workflow and downstream AI processing.

alert_engine.py

Converts prediction results into application alerts.

emergency_notification_service.py

Handles emergency persistence and notification escalation, including FCM and Twilio.

Database

PostgreSQL is used through SQLAlchemy.

Important entities include:

users
patients
doctor_profiles
doctor_verifications
doctor_patients
consultations
medications
patient_conditions
vital_logs
emergency_alerts

The deployed PostgreSQL schema is the source of truth for the actual database structure.

Firebase Notifications

Relevant frontend files:

frontend/lib/firebase-messaging.ts
frontend/providers/firebase-provider.tsx
frontend/public/firebase-messaging-sw.js

Foreground notifications can use the custom sound:

frontend/public/sounds/emergency-alert.mp3

The frontend preloads/unlocks the audio after user interaction to reduce foreground playback delay.

Browser security and autoplay policies can still restrict sound when the browser tab is fully backgrounded or closed.

Local Development

Prerequisites

Install:

Python 3.10+

Node.js

npm

PostgreSQL

Arduino IDE for hardware testing

Git

Backend

cd D:\majorproject\elderly-careackend

.env\Scripts\Activate.ps1

uvicorn app.main:app --reload

Frontend

Open another terminal:

cd D:\majorproject\elderly-carerontend

npm install
npm run dev

Use the frontend environment configuration to point the application to the running FastAPI backend.

FastAPI provides its normal Swagger/OpenAPI documentation while running locally.

Environment Variables

Do not commit real credentials.

Typical configuration includes:

DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your_secret

GEMINI_API_KEY=your_gemini_key

TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
TEST_NOTIFICATION_PHONE=your_test_phone

NEXT_PUBLIC_API_URL=your_backend_url

Use the exact variable names expected by the current application code and keep Firebase Admin credentials/private keys outside Git.

Critical Test Payload

For development testing of the critical path:

{
  "heart_rate": 145,
  "systolic_bp": 185,
  "diastolic_bp": 115,
  "spo2": 82,
  "temperature": 39.2,
  "respiratory_rate": 32,
  "sleep_hours": 3,
  "activity_steps": 100
}

Expected application behavior for a matching critical safety condition:

Critical safety condition
        |
        +--> FCM Push
        |
        +--> Twilio Call
        |
        v
Existing AI pipeline continues

The ML model's prediction and the fast safety classification are separate layers, so the ML output can differ from the safety-rule result.

Development Workflow

1. Start PostgreSQL
2. Start FastAPI
3. Start Next.js
4. Log in with the required role
5. Create/select a patient
6. Configure patient conditions and medications
7. Link doctor/caregiver as required
8. Submit or collect vitals
9. Run AI prediction
10. Monitor dashboards
11. Test emergency notification flow

IoT workflow:

Arduino UNO
   |
Sensors
   |
Device/serial integration
   |
Backend vital endpoint
   |
VitalLog
   |
Safety + AI
   |
Dashboard / FCM / Twilio

Security and Production Considerations

Before production deployment:

Never commit .env files containing secrets.

Use HTTPS.

Authenticate IoT devices before accepting patient data.

Validate all incoming sensor data.

Enforce server-side patient authorization.

Protect Firebase and Twilio credentials.

Rotate exposed credentials.

Configure database backups and access controls.

Add appropriate privacy and healthcare-data controls for the deployment region.

Medical Disclaimer

ElderlyCare is an academic/engineering prototype for health monitoring and decision-support workflows.

It does not provide a medical diagnosis and should not be used as the sole basis for treatment or emergency decisions.

Sensor measurements may be affected by device placement, motion, sensor quality and environmental conditions. Emergency rules and AI predictions should be reviewed by qualified healthcare professionals.

Project Goals

ElderlyCare demonstrates the integration of:

Full-stack development

REST APIs

Role-based access control

PostgreSQL

Machine learning

Explainable AI

Generative AI

RAG

IoT sensing

Real-time monitoring

Push notifications

Voice emergency escalation

Patient/doctor/caregiver workflows

License

No license should be claimed until one has been selected and added to the repository.