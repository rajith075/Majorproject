"use client";

import { useEffect, useRef, useState } from "react";

import FamilyHeader from "./FamilyHeader";
import FamilyOverview from "./FamilyOverview";
import FamilyAIInsight from "./FamilyAIInsight";
import FamilyVitals from "./FamilyVitals";
import FamilyDoctors from "./FamilyDoctors";

import { usePatientStore } from "@/store/patient-store";
import { getMyMedications } from "@/services/api/medication";

import {
  getPatientEmergencyAlerts,
  EmergencyAlert,
} from "@/services/api/emergency";

interface Medication {
  id: number;
  patient_id: number;
  medicine_name: string;
  dosage?: string | null;
  reminder_time?: string | null;
  before_food: boolean;
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
  night: boolean;
  active: boolean;

  // Real medication tracking fields
  status: "taken" | "pending" | "upcoming";
  given_by?: string | null;
  given_at?: string | null;
}

export default function FamilyDashboard() {
  const patient = usePatientStore((state) => state.patient);

  const [medications, setMedications] = useState<Medication[]>([]);
  const [medicationLoading, setMedicationLoading] = useState(true);

  const [emergencyAlerts, setEmergencyAlerts] = useState<EmergencyAlert[]>(
    []
  );
  const [emergencyLoading, setEmergencyLoading] = useState(true);

  const latestEmergencyAlertId = useRef<number | null>(null);

  // ==========================================================
  // UNLOCK EMERGENCY AUDIO (Chrome autoplay policy workaround)
  // ==========================================================

  useEffect(() => {
    const unlockEmergencySound = () => {
      const audio = new Audio("/sounds/emergency-alert.mp3");
      audio.volume = 0;

      audio
        .play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;

          console.log(
            "[EMERGENCY SOUND] Audio unlocked successfully."
          );

          // Remove listeners ONLY after successful unlock
          window.removeEventListener("click", unlockEmergencySound);
          window.removeEventListener("keydown", unlockEmergencySound);
        })
        .catch((error) => {
          console.warn(
            "[EMERGENCY SOUND] Audio unlock failed:",
            error
          );

          // Keep listeners active so another user interaction
          // can try again.
        });
    };

    window.addEventListener("click", unlockEmergencySound);
    window.addEventListener("keydown", unlockEmergencySound);

    return () => {
      window.removeEventListener("click", unlockEmergencySound);
      window.removeEventListener("keydown", unlockEmergencySound);
    };
  }, []);

  // ==========================================================
  // LOAD MEDICATIONS
  // ==========================================================

  useEffect(() => {
    const loadMedications = async () => {
      try {
        const data = await getMyMedications();

        console.log("FAMILY MEDICATION DATA:", data);

        setMedications(data || []);
      } catch (error) {
        console.error("FAILED TO LOAD FAMILY MEDICATIONS:", error);
        setMedications([]);
      } finally {
        setMedicationLoading(false);
      }
    };

    loadMedications();
  }, []);

  // ==========================================================
  // LOAD EMERGENCY ALERTS
  // ==========================================================

  useEffect(() => {
    const loadEmergencyAlerts = async () => {
      if (!patient?.id) {
        setEmergencyLoading(false);
        return;
      }

      try {
        const data = await getPatientEmergencyAlerts(patient.id);

        console.log("FAMILY EMERGENCY ALERTS:", data);

        const alerts = data || [];

        if (alerts.length > 0) {
          const newestAlert = alerts[0];

          if (latestEmergencyAlertId.current === null) {
            // First load: remember the latest existing alert.
            // Do NOT play sound for old alerts.
            latestEmergencyAlertId.current = newestAlert.id;
          } else if (newestAlert.id !== latestEmergencyAlertId.current) {
            // 🔊 NEW EMERGENCY ALERT DETECTED
            latestEmergencyAlertId.current = newestAlert.id;

            const audio = new Audio("/sounds/emergency-alert.mp3");
            audio.volume = 1.0;

            audio
              .play()
              .then(() => {
                console.log(
                  "[EMERGENCY SOUND] Custom alert sound played."
                );
              })
              .catch((error) => {
                console.error(
                  "[EMERGENCY SOUND] Failed to play:",
                  error
                );
              });
          }
        }

        setEmergencyAlerts(alerts);
      } catch (error) {
        console.error(
          "FAILED TO LOAD FAMILY EMERGENCY ALERTS:",
          error
        );

        setEmergencyAlerts([]);
      } finally {
        setEmergencyLoading(false);
      }
    };

    loadEmergencyAlerts();

    // Refresh emergency alerts every 3 seconds
    // so newly generated AI emergencies appear automatically.
    const interval = setInterval(() => {
      loadEmergencyAlerts();
    }, 3000);

    return () => clearInterval(interval);
  }, [patient?.id]);

  return (
    <div className="space-y-10 scroll-smooth">

      {/* ================= OVERVIEW ================= */}
      <section id="overview" className="scroll-mt-8">
        <FamilyHeader />

        <div className="mt-8">
          <FamilyOverview />
        </div>
      </section>

      {/* ================= AI INSIGHT ================= */}
      <section id="ai-insight" className="scroll-mt-8">
        <FamilyAIInsight />
      </section>

      {/* ================= CURRENT HEALTH ================= */}
      <section id="health" className="scroll-mt-8">
        <FamilyVitals />
      </section>

      {/* ================= MEDICATION ================= */}
      <section id="medication" className="scroll-mt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-100 p-3">
              <span className="text-xl">💊</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Medication
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Track the patient's scheduled medicines.
              </p>
            </div>
          </div>

          {/* Loading */}
          {medicationLoading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Loading medications...
              </p>
            </div>
          ) : medications.length === 0 ? (

            /* No medications */
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-600">
                No active medications found.
              </p>
            </div>

          ) : (

            /* Medication List */
            <div className="mt-6 space-y-4">
              {medications.map((medication) => {

                const schedule = [
                  medication.morning && "Morning",
                  medication.afternoon && "Afternoon",
                  medication.evening && "Evening",
                  medication.night && "Night",
                ]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <div
                    key={medication.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                      {/* Medication Details */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {medication.medicine_name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Dosage:{" "}
                          {medication.dosage || "Not specified"}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Schedule:{" "}
                          {schedule || "Not specified"}
                        </p>

                        {medication.reminder_time && (
                          <p className="mt-1 text-sm text-slate-500">
                            Time: {medication.reminder_time}
                          </p>
                        )}

                        {medication.before_food && (
                          <p className="mt-1 text-xs font-medium text-violet-600">
                            Take before food
                          </p>
                        )}
                      </div>

                      {/* Current Status */}
                      <div className="flex flex-col items-start gap-2 sm:items-end">

                        {/* Status Badge */}
                        <div
                          className={`w-fit rounded-xl border px-4 py-2 ${
                            medication.status === "taken"
                              ? "border-emerald-200 bg-emerald-50"
                              : medication.status === "upcoming"
                              ? "border-slate-200 bg-slate-100"
                              : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <p
                            className={`text-sm font-semibold ${
                              medication.status === "taken"
                                ? "text-emerald-700"
                                : medication.status === "upcoming"
                                ? "text-slate-700"
                                : "text-amber-700"
                            }`}
                          >
                            {medication.status === "taken"
                              ? "Given"
                              : medication.status === "upcoming"
                              ? "Upcoming"
                              : "Pending"}
                          </p>
                        </div>

                        {/* Given By */}
                        {medication.given_by && (
                          <p className="text-xs text-slate-500">
                            Given by {medication.given_by}
                          </p>
                        )}

                        {/* Given At */}
                        {medication.given_at && (
                          <p className="text-xs text-slate-400">
                            Given at{" "}
                            {new Date(
                              medication.given_at
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= ALERTS ================= */}
      <section id="alerts" className="scroll-mt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-3">
              <span className="text-xl">🚨</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Recent Alerts
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Important health notifications and warnings.
              </p>
            </div>
          </div>

          {/* Loading */}
          {emergencyLoading ? (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Loading alerts...
              </p>
            </div>
          ) : (
            (() => {
              const activeAlerts = emergencyAlerts.filter(
                (alert) => alert.status !== "RESOLVED"
              );

              if (activeAlerts.length === 0) {
                return (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <p className="text-sm font-semibold text-emerald-700">
                      No active alerts
                    </p>

                    <p className="mt-1 text-sm text-emerald-600">
                      Everything looks stable at the moment.
                    </p>
                  </div>
                );
              }

              return (
                <div className="mt-6 space-y-4">
                  {activeAlerts.slice(0, 5).map((alert) => {

                    const isCritical =
                      alert.status === "CRITICAL";

                    return (
                      <div
                        key={alert.id}
                        className={`rounded-2xl border p-5 ${
                          isCritical
                            ? "border-red-200 bg-red-50"
                            : "border-amber-200 bg-amber-50"
                        }`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                          {/* Alert Details */}
                          <div className="flex items-start gap-3">

                            <div
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                isCritical
                                  ? "bg-red-100"
                                  : "bg-amber-100"
                              }`}
                            >
                              <span className="text-xl">
                                {isCritical ? "🚨" : "⚠️"}
                              </span>
                            </div>

                            <div>
                              <div className="flex flex-wrap items-center gap-2">

                                <h3 className="text-base font-bold text-slate-900">
                                  {alert.event_type}
                                </h3>

                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                                    isCritical
                                      ? "bg-red-600 text-white"
                                      : "bg-amber-500 text-white"
                                  }`}
                                >
                                  {isCritical
                                    ? "CRITICAL"
                                    : "WARNING"}
                                </span>

                              </div>

                              {alert.notes && (
                                <p className="mt-2 text-sm text-slate-600">
                                  {alert.notes.split(" | SMS=")[0]}
                                </p>
                              )}

                              <p className="mt-2 text-xs text-slate-400">
                                Detected{" "}
                                {new Date(
                                  alert.detected_at
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Emergency ID */}
                          <div className="shrink-0 rounded-xl bg-white/70 px-4 py-3">
                            <p className="text-xs font-medium text-slate-400">
                              Emergency ID
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              #{alert.id}
                            </p>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()
          )}

        </div>
      </section>

      {/* ================= PATIENT ================= */}
      <section id="patient" className="scroll-mt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Patient Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Important information about the patient.
            </p>
          </div>

          {patient && (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

              <PatientInfo
                label="Patient"
                value={patient.full_name}
              />

              <PatientInfo
                label="Age"
                value={`${patient.age} years`}
              />

              <PatientInfo
                label="Blood Group"
                value={patient.blood_group}
              />

              <PatientInfo
                label="Medical Conditions"
                value={
                  patient.medical_conditions ||
                  "None recorded"
                }
              />

              <PatientInfo
                label="Caregiver"
                value={
                  patient.assigned_caregiver ||
                  "Not assigned"
                }
              />

            </div>
          )}

        </div>
      </section>

      {/* ================= DOCTORS ================= */}
      <FamilyDoctors />

    </div>
  );
}

function PatientInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}