"use client";

import { useEffect, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  XCircle,
  History,
} from "lucide-react";

import {
  confirmCaregiverEmergency,
  confirmPatientEmergency,
  getPatientEmergencyAlerts,
  EmergencyAlert,
} from "@/services/api/emergency";

import { usePatientStore } from "@/store/patient-store";

export default function AlertsPage() {
  const patient = usePatientStore(
    (state) => state.patient
  );

  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] =
    useState<number | null>(null);

  // ==========================================================
  // LOAD ALERTS
  // ==========================================================

  const loadAlerts = async () => {
    if (!patient?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      console.log(
        "🚨 LOADING EMERGENCY ALERTS FOR PATIENT:",
        patient.id
      );

      const data =
        await getPatientEmergencyAlerts(patient.id);

      console.log(
        "🚨 EMERGENCY ALERTS:",
        data
      );

      setAlerts(data);
    } catch (error) {
      console.error(
        "❌ FAILED TO LOAD EMERGENCY ALERTS:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD WHEN PATIENT AVAILABLE
  // ==========================================================

  useEffect(() => {
    loadAlerts();
  }, [patient?.id]);

  // ==========================================================
  // PATIENT CONFIRMATION
  // ==========================================================

  const handlePatientConfirmation = async (
    alertId: number,
    isSafe: boolean
  ) => {
    try {
      setProcessing(alertId);

      console.log(
        "👤 PATIENT CONFIRMATION:",
        isSafe
      );

      await confirmPatientEmergency(
        alertId,
        isSafe
      );

      await loadAlerts();
    } catch (error) {
      console.error(
        "❌ PATIENT CONFIRMATION FAILED:",
        error
      );
    } finally {
      setProcessing(null);
    }
  };

  // ==========================================================
  // CAREGIVER CONFIRMATION
  // ==========================================================

  const handleCaregiverConfirmation = async (
    alertId: number,
    isSafe: boolean
  ) => {
    try {
      setProcessing(alertId);

      console.log(
        "👨‍⚕️ CAREGIVER CONFIRMATION:",
        isSafe
      );

      await confirmCaregiverEmergency(
        alertId,
        isSafe
      );

      await loadAlerts();
    } catch (error) {
      console.error(
        "❌ CAREGIVER CONFIRMATION FAILED:",
        error
      );
    } finally {
      setProcessing(null);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent" />

          <p className="text-sm font-medium text-slate-500">
            Loading emergency alerts...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================================
  // ACTIVE + HISTORY
  // ==========================================================

  const activeAlerts = alerts.filter(
    (alert) =>
      alert.status === "DETECTED" ||
      alert.status === "SOS_PENDING"
  );

  const historyAlerts = alerts.filter(
    (alert) =>
      alert.status === "RESOLVED"
  );

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <div className="space-y-8">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="flex items-center gap-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">

          <ShieldAlert size={32} />

        </div>

        <div>

          <h1 className="text-4xl font-bold text-slate-900">
            Emergency Alerts
          </h1>

          <p className="mt-1 text-lg text-slate-500">

            Monitor emergency events for{" "}

            <span className="font-semibold text-slate-700">
              {patient?.full_name || "Patient"}
            </span>

          </p>

        </div>

      </div>

      {/* ================================================== */}
      {/* ACTIVE EMERGENCIES */}
      {/* ================================================== */}

      {activeAlerts.length > 0 && (

        <section className="space-y-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">

              <AlertTriangle
                size={21}
                className="text-red-600"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Active Emergencies
              </h2>

              <p className="text-sm text-slate-500">
                Immediate attention may be required
              </p>

            </div>

            <span className="ml-auto rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
              {activeAlerts.length} Active
            </span>

          </div>

          {/* ACTIVE ALERTS */}

          <div className="space-y-6">

            {activeAlerts.map((alert) => {

              const isSOS =
                alert.status === "SOS_PENDING";

              const isProcessing =
                processing === alert.id;

              return (

                <div
                  key={alert.id}
                  className="overflow-hidden rounded-[32px] border border-red-200 bg-white shadow-lg"
                >

                  {/* ====================================== */}
                  {/* ALERT HEADER */}
                  {/* ====================================== */}

                  <div className="flex flex-col gap-4 bg-gradient-to-r from-red-50 via-rose-50 to-red-50 px-8 py-6 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-4">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500 text-white shadow-md">

                        <AlertTriangle size={28} />

                      </div>

                      <div>

                        <h3 className="text-xl font-bold text-slate-900">

                          {alert.event_type === "FALL"
                            ? "Fall Detected"
                            : "Emergency Detected"}

                        </h3>

                        <p className="text-sm text-slate-500">
                          Alert #{alert.id}
                        </p>

                      </div>

                    </div>

                    <span
                      className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
                        isSOS
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {isSOS
                        ? "SOS PENDING"
                        : "ACTION REQUIRED"}
                    </span>

                  </div>

                  {/* ====================================== */}
                  {/* PATIENT + TIME */}
                  {/* ====================================== */}

                  <div className="grid gap-6 border-b border-slate-100 p-8 md:grid-cols-2">

                    {/* PATIENT */}

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">

                        <UserRound
                          size={21}
                          className="text-violet-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm text-slate-500">
                          Patient
                        </p>

                        <p className="text-lg font-bold text-slate-900">
                          {patient?.full_name ||
                            "Unknown Patient"}
                        </p>

                        {patient?.age && (
                          <p className="text-xs text-slate-500">
                            Age {patient.age}
                          </p>
                        )}

                      </div>

                    </div>

                    {/* TIME */}

                    <div className="flex items-center gap-4">

                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">

                        <Clock
                          size={21}
                          className="text-slate-600"
                        />

                      </div>

                      <div>

                        <p className="text-sm text-slate-500">
                          Detected
                        </p>

                        <p className="font-semibold text-slate-900">
                          {new Date(
                            alert.detected_at
                          ).toLocaleString()}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* ====================================== */}
                  {/* LOCATION */}
                  {/* ====================================== */}

                  <div className="border-b border-slate-100 p-8">

                    <div className="flex items-center gap-3">

                      <MapPin
                        className="text-red-500"
                        size={21}
                      />

                      <h3 className="font-bold text-slate-900">
                        Emergency Location
                      </h3>

                    </div>

                    <div className="mt-4 rounded-2xl bg-slate-50 p-5">

                      <div className="grid gap-2 md:grid-cols-2">

                        <p className="font-mono text-sm text-slate-600">
                          Latitude:{" "}
                          <span className="font-semibold">
                            {alert.latitude ??
                              "Unavailable"}
                          </span>
                        </p>

                        <p className="font-mono text-sm text-slate-600">
                          Longitude:{" "}
                          <span className="font-semibold">
                            {alert.longitude ??
                              "Unavailable"}
                          </span>
                        </p>

                      </div>

                      {alert.latitude !== null &&
                        alert.longitude !== null && (

                          <a
                            href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-500 px-5 py-3 font-semibold text-white transition hover:bg-red-600"
                          >

                            <MapPin size={18} />

                            View GPS Location

                          </a>

                        )}

                    </div>

                  </div>

                  {/* ====================================== */}
                  {/* PATIENT CONFIRMATION */}
                  {/* ====================================== */}

                  <div className="border-b border-slate-100 p-8">

                    <div className="rounded-2xl bg-violet-50 p-6">

                      <div className="flex items-center gap-3">

                        <Phone
                          className="text-violet-600"
                          size={21}
                        />

                        <h3 className="text-lg font-bold text-slate-900">
                          Patient Confirmation
                        </h3>

                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        Contact the patient and confirm
                        whether they are safe.
                      </p>

                      {/* CALL */}

                      {patient?.phone && (

                        <a
                          href={`tel:${patient.phone}`}
                          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700"
                        >

                          <Phone size={18} />

                          Call Patient

                        </a>

                      )}

                      {/* CONFIRMATION */}

                      <div className="mt-6 flex flex-wrap gap-3">

                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handlePatientConfirmation(
                              alert.id,
                              true
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <CheckCircle2 size={18} />

                          Patient Is Safe

                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handlePatientConfirmation(
                              alert.id,
                              false
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <AlertTriangle size={18} />

                          Patient Needs Help

                        </button>

                      </div>

                    </div>

                  </div>

                  {/* ====================================== */}
                  {/* CAREGIVER CONFIRMATION */}
                  {/* ====================================== */}

                  <div className="p-8">

                    <div className="rounded-2xl bg-slate-50 p-6">

                      <div className="flex items-center gap-3">

                        <ShieldAlert
                          className="text-slate-700"
                          size={21}
                        />

                        <h3 className="text-lg font-bold text-slate-900">
                          Caregiver Confirmation
                        </h3>

                      </div>

                      <p className="mt-2 text-sm text-slate-600">
                        Confirm the patient's condition
                        after checking on them.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">

                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handleCaregiverConfirmation(
                              alert.id,
                              true
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <CheckCircle2 size={18} />

                          Caregiver Confirms Safe

                        </button>

                        <button
                          disabled={isProcessing}
                          onClick={() =>
                            handleCaregiverConfirmation(
                              alert.id,
                              false
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-6 py-3 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                          <XCircle size={18} />

                          Confirm Emergency

                        </button>

                      </div>

                    </div>

                  </div>

                  {/* ====================================== */}
                  {/* EMERGENCY CONTACT */}
                  {/* ====================================== */}

                  {patient?.emergency_contact_name && (

                    <div className="border-t border-red-100 bg-red-50 p-8">

                      <h3 className="font-bold text-red-900">
                        Emergency Contact
                      </h3>

                      <p className="mt-2 text-sm text-red-700">
                        {patient.emergency_contact_name}
                      </p>

                      {patient.emergency_contact_phone && (

                        <a
                          href={`tel:${patient.emergency_contact_phone}`}
                          className="mt-3 inline-flex items-center gap-2 font-semibold text-red-700 hover:text-red-900"
                        >

                          <Phone size={17} />

                          {patient.emergency_contact_phone}

                        </a>

                      )}

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        </section>

      )}

      {/* ================================================== */}
      {/* NO ACTIVE EMERGENCIES */}
      {/* ================================================== */}

      {activeAlerts.length === 0 && (

        <div className="rounded-[32px] border border-emerald-100 bg-white p-10 shadow-sm">

          <div className="flex flex-col items-center justify-center text-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">

              <CheckCircle2
                size={40}
                className="text-emerald-500"
              />

            </div>

            <h2 className="mt-5 text-2xl font-bold text-slate-900">
              No Active Emergencies
            </h2>

            <p className="mt-2 max-w-lg text-slate-500">
              There are currently no emergency events
              requiring attention for{" "}
              <span className="font-semibold text-slate-700">
                {patient?.full_name || "this patient"}
              </span>.
            </p>

          </div>

        </div>

      )}

      {/* ================================================== */}
      {/* EMERGENCY HISTORY */}
      {/* ================================================== */}

      {historyAlerts.length > 0 && (

        <section className="space-y-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">

              <History
                size={21}
                className="text-slate-600"
              />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-slate-900">
                Emergency History
              </h2>

              <p className="text-sm text-slate-500">
                Previously resolved emergency events
              </p>

            </div>

          </div>

          {/* HISTORY */}

          <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

            {historyAlerts.map(
              (alert, index) => (

                <div
                  key={alert.id}
                  className={`flex flex-col gap-5 p-6 transition hover:bg-slate-50 md:flex-row md:items-center md:justify-between ${
                    index !==
                    historyAlerts.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >

                  {/* LEFT */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">

                      <CheckCircle2
                        size={22}
                        className="text-emerald-500"
                      />

                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="font-bold text-slate-900">

                          {alert.event_type === "FALL"
                            ? "Fall Detected"
                            : "Emergency Event"}

                        </h3>

                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Resolved
                        </span>

                      </div>

                      <p className="mt-1 text-sm text-slate-500">

                        {patient?.full_name ||
                          "Unknown Patient"}

                        {" • "}
                        Alert #{alert.id}

                      </p>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div className="flex flex-col gap-2 md:items-end">

                    <div className="flex items-center gap-2 text-sm text-slate-600">

                      <Clock size={16} />

                      {new Date(
                        alert.detected_at
                      ).toLocaleString()}

                    </div>

                    <p className="text-xs font-medium text-slate-400">

                      {alert.resolution ===
                      "PATIENT_SAFE"
                        ? "Patient confirmed safe"
                        : alert.resolution ===
                          "CAREGIVER_CONFIRMED_SAFE"
                        ? "Caregiver confirmed safe"
                        : "Emergency resolved"}

                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      )}

      {/* ================================================== */}
      {/* NO HISTORY */}
      {/* ================================================== */}

      {historyAlerts.length === 0 &&
        activeAlerts.length > 0 && (

          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">

            <History
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 font-semibold text-slate-700">
              No resolved emergencies yet
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Resolved emergency events will appear
              here.
            </p>

          </div>

        )}

    </div>
  );
}