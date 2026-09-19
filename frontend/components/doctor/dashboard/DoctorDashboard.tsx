"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  Clock3,
  UserRound,
  HeartPulse,
  FileText,
  Pill,
  Stethoscope,
  ClipboardPenLine,
  Phone,
  MapPin,
  ChevronRight,
  X,
  Clock,
} from "lucide-react";

import { useAuthStore } from "@/store/auth.store";

import {
  getDoctorPatient,
  getDoctorConsultations,
  getDoctorMedications,
  prescribeMedication,
  DoctorPatient,
  DoctorConsultation,
  PrescribedMedication,
  PrescribeMedicationData,
} from "@/services/api/doctor";

export default function DoctorDashboard() {
  const user = useAuthStore((state) => state.user);

  const [patient, setPatient] = useState<DoctorPatient | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(true);

  const [consultations, setConsultations] = useState<
    DoctorConsultation[]
  >([]);
  const [loadingConsultations, setLoadingConsultations] = useState(true);

  // Local-only until backend supports an "accepted" status.
  const [acceptedConsultationId, setAcceptedConsultationId] =
    useState<number | null>(null);

  // =====================================================
  // MEDICATION STATE
  // =====================================================

  const [medications, setMedications] = useState<
    PrescribedMedication[]
  >([]);

  const [loadingMedications, setLoadingMedications] = useState(true);

  const [showMedicationModal, setShowMedicationModal] =
    useState(false);

  const [prescribing, setPrescribing] = useState(false);

  const [medicationError, setMedicationError] = useState("");

  const [medicationForm, setMedicationForm] =
    useState<PrescribeMedicationData>({
      medicine_name: "",
      dosage: "",
      reminder_time: "",
      before_food: false,
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    });

  // =====================================================
  // LOAD PATIENT
  // =====================================================

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const data = await getDoctorPatient();

        setPatient(data);
      } catch (error) {
        console.error("Failed to load doctor patient:", error);
      } finally {
        setLoadingPatient(false);
      }
    };

    loadPatient();
  }, []);

  // =====================================================
  // LOAD DOCTOR CONSULTATIONS
  // =====================================================

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const data = await getDoctorConsultations();

        console.log(
          "📅 DOCTOR DASHBOARD CONSULTATIONS:",
          JSON.stringify(data, null, 2)
        );

        setConsultations(data || []);
      } catch (error) {
        console.error(
          "Failed to load doctor consultations:",
          error
        );

        setConsultations([]);
      } finally {
        setLoadingConsultations(false);
      }
    };

    loadConsultations();
  }, []);

  // =====================================================
  // LOAD PATIENT MEDICATIONS
  // =====================================================

  useEffect(() => {
    if (!patient?.id) {
      return;
    }

    const loadMedications = async () => {
      try {
        setLoadingMedications(true);

        const data = await getDoctorMedications(patient.id);

        console.log(
          "💊 DOCTOR PATIENT MEDICATIONS:",
          JSON.stringify(data, null, 2)
        );

        setMedications(data || []);
      } catch (error) {
        console.error(
          "Failed to load patient medications:",
          error
        );

        setMedications([]);
      } finally {
        setLoadingMedications(false);
      }
    };

    loadMedications();
  }, [patient?.id]);

  // =====================================================
  // GET NEXT UPCOMING CONSULTATION
  // =====================================================

  const upcomingConsultation = consultations
    .filter((consultation) => {
      if (consultation.status !== "scheduled") {
        return false;
      }

      const appointmentDateTime = new Date(
        `${consultation.scheduled_date}T${consultation.scheduled_time}`
      );

      return appointmentDateTime >= new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(
        `${a.scheduled_date}T${a.scheduled_time}`
      ).getTime();

      const dateB = new Date(
        `${b.scheduled_date}T${b.scheduled_time}`
      ).getTime();

      return dateA - dateB;
    })[0];

  // =====================================================
  // FORMAT APPOINTMENT DATE
  // =====================================================

  const formatAppointmentDate = (
    consultation: DoctorConsultation
  ) => {
    const date = new Date(
      `${consultation.scheduled_date}T${consultation.scheduled_time}`
    );

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // =====================================================
  // FORMAT APPOINTMENT TIME
  // =====================================================

  const formatAppointmentTime = (
    consultation: DoctorConsultation
  ) => {
    const date = new Date(
      `${consultation.scheduled_date}T${consultation.scheduled_time}`
    );

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =====================================================
  // MEDICATION HELPERS
  // =====================================================

  const currentMedications = medications.filter(
    (medication) => medication.active
  );

  const previousMedications = medications.filter(
    (medication) => !medication.active
  );

  const getMedicationSchedule = (
    medication: PrescribedMedication
  ) => {
    const schedule: string[] = [];

    if (medication.morning) {
      schedule.push("Morning");
    }

    if (medication.afternoon) {
      schedule.push("Afternoon");
    }

    if (medication.evening) {
      schedule.push("Evening");
    }

    if (medication.night) {
      schedule.push("Night");
    }

    return schedule.length > 0
      ? schedule.join(" • ")
      : "Schedule not specified";
  };

  const formatReminderTime = (
    reminderTime: string | null
  ) => {
    if (!reminderTime) {
      return null;
    }

    const [hours, minutes] = reminderTime
      .split(":")
      .map(Number);

    if (
      Number.isNaN(hours) ||
      Number.isNaN(minutes)
    ) {
      return reminderTime;
    }

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // =====================================================
  // RESET MEDICATION FORM
  // =====================================================

  const resetMedicationForm = () => {
    setMedicationForm({
      medicine_name: "",
      dosage: "",
      reminder_time: "",
      before_food: false,
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
    });

    setMedicationError("");
  };

  // =====================================================
  // CLOSE MEDICATION MODAL
  // =====================================================

  const closeMedicationModal = () => {
    if (prescribing) {
      return;
    }

    setShowMedicationModal(false);
    resetMedicationForm();
  };

  // =====================================================
  // PRESCRIBE MEDICATION
  // =====================================================

  const handlePrescribeMedication = async () => {
    if (!patient?.id) {
      setMedicationError(
        "No patient is currently assigned to this doctor."
      );
      return;
    }

    if (!medicationForm.medicine_name.trim()) {
      setMedicationError(
        "Please enter the medicine name."
      );
      return;
    }

    if (!medicationForm.dosage?.trim()) {
      setMedicationError(
        "Please enter the dosage."
      );
      return;
    }

    const hasSchedule =
      medicationForm.morning ||
      medicationForm.afternoon ||
      medicationForm.evening ||
      medicationForm.night;

    if (!hasSchedule) {
      setMedicationError(
        "Please select at least one medication schedule."
      );
      return;
    }

    try {
      setPrescribing(true);
      setMedicationError("");

      await prescribeMedication(
        patient.id,
        medicationForm
      );

      // Refresh medication list from backend
      const updatedMedications =
        await getDoctorMedications(patient.id);

      setMedications(updatedMedications || []);

      setShowMedicationModal(false);

      resetMedicationForm();
    } catch (error: any) {
      console.error(
        "Failed to prescribe medication:",
        error
      );

      const backendMessage =
        error?.response?.data?.detail;

      setMedicationError(
        backendMessage ||
          "Unable to prescribe medication. Please try again."
      );
    } finally {
      setPrescribing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ================= HEADER ================= */}

        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
              <Stethoscope className="h-4 w-4" />
              Doctor Portal
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Good afternoon, Doctor 👋
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Review your patient's information and manage today's consultation.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Stethoscope className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Dr. {user?.full_name || "Doctor"}
              </p>

              <p className="text-xs text-slate-500">
                Doctor
              </p>
            </div>
          </div>
        </section>

        {/* ================= APPOINTMENT ================= */}

        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
          {loadingConsultations ? (
            <div className="flex items-center gap-4 p-6 lg:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Consultations
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Loading appointments...
                </p>
              </div>
            </div>
          ) : !upcomingConsultation ? (
            <div className="flex items-center gap-4 p-6 lg:p-8">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50">
                <CalendarDays className="h-6 w-6 text-slate-400" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Consultations
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  No Upcoming Appointments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  You currently have no scheduled consultations.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">

              {/* Consultation Info */}

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Upcoming Consultation
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {patient?.full_name || "Patient"}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {upcomingConsultation.reason ||
                      "Routine health consultation"}
                  </p>
                </div>
              </div>

              {/* Date / Time / Action */}

              <div className="flex flex-wrap items-center gap-6">

                {/* Date */}

                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Date
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {formatAppointmentDate(
                        upcomingConsultation
                      )}
                    </p>
                  </div>
                </div>

                {/* Time */}

                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-slate-400" />

                  <div>
                    <p className="text-xs text-slate-400">
                      Time
                    </p>

                    <p className="text-sm font-semibold text-slate-700">
                      {formatAppointmentTime(
                        upcomingConsultation
                      )}
                    </p>
                  </div>
                </div>

                {/* Status */}

                <div
                  className={`rounded-xl px-4 py-2 ${
                    acceptedConsultationId ===
                    upcomingConsultation.id
                      ? "border border-blue-200 bg-blue-50"
                      : "border border-emerald-200 bg-emerald-50"
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      acceptedConsultationId ===
                      upcomingConsultation.id
                        ? "text-blue-700"
                        : "text-emerald-700"
                    }`}
                  >
                    {acceptedConsultationId ===
                    upcomingConsultation.id
                      ? "Accepted"
                      : "Scheduled"}
                  </p>
                </div>

                {/* Accept Consultation */}

                <button
                  type="button"
                  onClick={() =>
                    setAcceptedConsultationId(
                      upcomingConsultation.id
                    )
                  }
                  disabled={
                    acceptedConsultationId ===
                    upcomingConsultation.id
                  }
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition ${
                    acceptedConsultationId ===
                    upcomingConsultation.id
                      ? "cursor-default bg-blue-400"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {acceptedConsultationId ===
                  upcomingConsultation.id
                    ? "Consultation Accepted"
                    : "Accept Consultation"}

                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ================= PATIENT OVERVIEW ================= */}

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">
              Patient Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Essential information about your patient.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">

            {/* Patient */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50">
                  <UserRound className="h-7 w-7 text-violet-600" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {loadingPatient
                      ? "Loading patient..."
                      : patient?.full_name ||
                        "No patient assigned"}
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {patient
                      ? `${patient.age} years • ${patient.gender}`
                      : "Patient information unavailable"}
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Blood Group
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {patient?.blood_group ||
                      "Not available"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Medical Conditions
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {patient?.medical_conditions ||
                      "No conditions recorded"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Allergies
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {patient?.allergies === "None"
                      ? "No known allergies"
                      : patient?.allergies ||
                        "Not recorded"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Caregiver
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {patient?.assigned_caregiver ||
                      "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
                <Phone className="h-5 w-5 text-rose-600" />
              </div>

              <h3 className="mt-5 text-base font-bold text-slate-900">
                Emergency Contact
              </h3>

              <p className="mt-2 text-sm font-semibold text-slate-700">
                {patient?.emergency_contact_name ||
                  "No emergency contact"}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {patient?.relationship
                  ? `Primary ${patient.relationship.toLowerCase()} contact`
                  : "Primary emergency contact"}
              </p>

              <button
                type="button"
                className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Contact Family
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= HEALTH REPORT ================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <HeartPulse className="h-6 w-6 text-emerald-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Health Report
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  View the patient's recorded health information,
                  vital history and available health trends.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  "/doctor/health-report")
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4" />
              View Health Report
            </button>
          </div>
        </section>

        {/* ================= MEDICATION ================= */}

        <section>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Medication Management
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Review current prescriptions and prescribe new treatment.
              </p>
            </div>
          </div>

          {/* CURRENT MEDICATIONS */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                  <Pill className="h-6 w-6 text-amber-600" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Current Medications
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Active prescriptions for this patient.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setMedicationError("");
                  setShowMedicationModal(true);
                }}
                disabled={!patient}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Pill className="h-4 w-4" />
                Add / Prescribe Medication
              </button>
            </div>

            <div className="mt-6">

              {loadingMedications ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">
                    Loading medications...
                  </p>
                </div>
              ) : currentMedications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <Pill className="mx-auto h-7 w-7 text-slate-300" />

                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No current medications
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Prescribe a medication to add it to the patient's current treatment plan.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {currentMedications.map(
                    (medication) => (
                      <div
                        key={medication.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <h4 className="text-base font-bold text-slate-900">
                              {medication.medicine_name}
                            </h4>

                            <p className="mt-1 text-sm text-slate-600">
                              {medication.dosage ||
                                "Dosage not specified"}
                            </p>
                          </div>

                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">

                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600">
                            <Clock className="h-3.5 w-3.5" />
                            {getMedicationSchedule(
                              medication
                            )}
                          </span>

                          {medication.reminder_time && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatReminderTime(
                                medication.reminder_time
                              )}
                            </span>
                          )}

                          {medication.before_food && (
                            <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-600">
                              Before food
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PREVIOUS MEDICATIONS */}

          <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <Pill className="h-6 w-6 text-slate-500" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Previous Medications
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Read-only history of medications that are no longer active.
                </p>
              </div>
            </div>

            <div className="mt-6">

              {loadingMedications ? (
                <p className="text-sm text-slate-400">
                  Loading medication history...
                </p>
              ) : previousMedications.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">
                    No previous medications
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Previous prescriptions will remain visible here when they are discontinued.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {previousMedications.map(
                    (medication) => (
                      <div
                        key={medication.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">

                          <div>
                            <h4 className="text-base font-bold text-slate-800">
                              {medication.medicine_name}
                            </h4>

                            <p className="mt-1 text-sm text-slate-500">
                              {medication.dosage ||
                                "Dosage not specified"}
                            </p>
                          </div>

                          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-600">
                            Previous
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">

                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            {getMedicationSchedule(
                              medication
                            )}
                          </span>

                          {medication.reminder_time && (
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-500">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatReminderTime(
                                medication.reminder_time
                              )}
                            </span>
                          )}

                          {medication.before_food && (
                            <span className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-500">
                              Before food
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ================= DOCTOR NOTES ================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50">
              <ClipboardPenLine className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Doctor Notes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Record important observations and consultation notes.
              </p>
            </div>
          </div>

          <textarea
            placeholder="Enter consultation notes..."
            className="mt-6 min-h-32 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save Notes
            </button>
          </div>
        </section>

        {/* ================= FOOTER ================= */}

        <div className="flex items-center justify-center gap-2 pb-6 text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5" />
          ElderlyCare Doctor Portal
        </div>
      </div>

      {/* =====================================================
          PRESCRIBE MEDICATION MODAL
          ===================================================== */}

      {showMedicationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">

          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-slate-100 p-6">

              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                    <Pill className="h-5 w-5 text-amber-600" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Prescribe Medication
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Add a new medication for{" "}
                      {patient?.full_name || "the patient"}.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={closeMedicationModal}
                disabled={prescribing}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}

            <div className="max-h-[75vh] overflow-y-auto p-6">

              {medicationError && (
                <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {medicationError}
                </div>
              )}

              {/* Medicine + Dosage */}

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Medicine Name
                  </label>

                  <input
                    type="text"
                    value={
                      medicationForm.medicine_name
                    }
                    onChange={(event) =>
                      setMedicationForm((previous) => ({
                        ...previous,
                        medicine_name:
                          event.target.value,
                      }))
                    }
                    placeholder="e.g. Amlodipine"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Dosage
                  </label>

                  <input
                    type="text"
                    value={
                      medicationForm.dosage || ""
                    }
                    onChange={(event) =>
                      setMedicationForm((previous) => ({
                        ...previous,
                        dosage:
                          event.target.value,
                      }))
                    }
                    placeholder="e.g. 5 mg"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Reminder */}

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Reminder Time
                </label>

                <input
                  type="time"
                  value={
                    medicationForm.reminder_time ||
                    ""
                  }
                  onChange={(event) =>
                    setMedicationForm((previous) => ({
                      ...previous,
                      reminder_time:
                        event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-1/2"
                />
              </div>

              {/* Food Timing */}

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <p className="text-sm font-semibold text-slate-800">
                  Food Timing
                </p>

                <label className="mt-4 flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={
                      medicationForm.before_food
                    }
                    onChange={(event) =>
                      setMedicationForm(
                        (previous) => ({
                          ...previous,
                          before_food:
                            event.target.checked,
                        })
                      )
                    }
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-600">
                    Take before food
                  </span>
                </label>
              </div>

              {/* Schedule */}

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <p className="text-sm font-semibold text-slate-800">
                  Medication Schedule
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Select when the medication should be taken.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                  {[
                    {
                      key: "morning",
                      label: "Morning",
                    },
                    {
                      key: "afternoon",
                      label: "Afternoon",
                    },
                    {
                      key: "evening",
                      label: "Evening",
                    },
                    {
                      key: "night",
                      label: "Night",
                    },
                  ].map((item) => {
                    const key =
                      item.key as
                        | "morning"
                        | "afternoon"
                        | "evening"
                        | "night";

                    return (
                      <label
                        key={item.key}
                        className={`flex cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-sm font-medium transition ${
                          medicationForm[key]
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            medicationForm[key]
                          }
                          onChange={(event) =>
                            setMedicationForm(
                              (previous) => ({
                                ...previous,
                                [key]:
                                  event.target.checked,
                              })
                            )
                          }
                          className="sr-only"
                        />

                        {item.label}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 p-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeMedicationModal}
                disabled={prescribing}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePrescribeMedication}
                disabled={prescribing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <Pill className="h-4 w-4" />

                {prescribing
                  ? "Prescribing..."
                  : "Prescribe Medication"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}