"use client";

import { useEffect, useState } from "react";
import {
  Stethoscope,
  MapPin,
  BriefcaseMedical,
  BadgeCheck,
  ChevronRight,
  X,
  CalendarDays,
  Clock3,
  UserRound,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  getVerifiedDoctors,
  getDoctorProfile,
  bookConsultation,
  FamilyDoctor,
} from "@/services/api/doctor";

import { usePatientStore } from "@/store/patient-store";

export default function FamilyDoctors() {
  const patient = usePatientStore((state) => state.patient);

  const [doctors, setDoctors] = useState<FamilyDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile modal
  const [profileDoctor, setProfileDoctor] =
    useState<FamilyDoctor | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Booking modal
  const [bookingDoctor, setBookingDoctor] =
    useState<FamilyDoctor | null>(null);

  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [reason, setReason] = useState("");

  const [booking, setBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const data = await getVerifiedDoctors();

        console.log("FAMILY VERIFIED DOCTORS:", data);

        setDoctors(data || []);
      } catch (error) {
        console.error("FAILED TO LOAD VERIFIED DOCTORS:", error);
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  // ==========================================================
  // VIEW DOCTOR PROFILE
  // ==========================================================

  const handleViewProfile = async (doctor: FamilyDoctor) => {
    setProfileLoading(true);
    setProfileDoctor(doctor);

    try {
      const data = await getDoctorProfile(doctor.doctor_id);

      setProfileDoctor(data);
    } catch (error) {
      console.error("FAILED TO LOAD DOCTOR PROFILE:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  // ==========================================================
  // OPEN BOOKING
  // ==========================================================

  const handleOpenBooking = (doctor: FamilyDoctor) => {
    setBookingDoctor(doctor);
    setScheduledDate("");
    setScheduledTime("");
    setReason("");
    setBookingError("");
    setBookingSuccess(false);
  };

  // ==========================================================
  // BOOK APPOINTMENT
  // ==========================================================

  const handleBookAppointment = async () => {
    if (!patient) {
      setBookingError(
        "Patient information is not available. Please refresh the page."
      );
      return;
    }

    if (!bookingDoctor) {
      setBookingError("Please select a doctor.");
      return;
    }

    if (!scheduledDate) {
      setBookingError("Please select an appointment date.");
      return;
    }

    if (!scheduledTime) {
      setBookingError("Please select an appointment time.");
      return;
    }

    try {
      setBooking(true);
      setBookingError("");

      const appointment = await bookConsultation({
        patient_id: patient.id,
        doctor_id: bookingDoctor.doctor_id,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        reason: reason.trim() || "Routine health consultation",
      });

      console.log("APPOINTMENT BOOKED:", appointment);

      setBookingSuccess(true);
    } catch (error: any) {
      console.error("FAILED TO BOOK APPOINTMENT:", error);

      const message =
        error?.response?.data?.detail ||
        "Unable to book the appointment. Please try again.";

      setBookingError(message);
    } finally {
      setBooking(false);
    }
  };

  // ==========================================================
  // CLOSE BOOKING MODAL
  // ==========================================================

  const closeBooking = () => {
    if (booking) return;

    setBookingDoctor(null);
    setBookingSuccess(false);
    setBookingError("");
  };

  return (
    <>
      <section id="doctors" className="scroll-mt-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
              <Stethoscope className="h-6 w-6 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Doctors
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Find a verified doctor and book a consultation for your
                loved one.
              </p>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">
                Loading verified doctors...
              </p>
            </div>
          )}

          {/* No doctors */}
          {!loading && doctors.length === 0 && (
            <div className="mt-6 rounded-2xl bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-600">
                No verified doctors are currently available.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Please check again later.
              </p>
            </div>
          )}

          {/* Doctors */}
          {!loading && doctors.length > 0 && (
            <div className="mt-6 grid gap-5 lg:grid-cols-2">
              {doctors.map((doctor) => (
                <div
                  key={doctor.doctor_id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-blue-200 hover:shadow-sm"
                >
                  {/* Doctor Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">
                        <Stethoscope className="h-6 w-6 text-blue-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">
                            {doctor.full_name}
                          </h3>

                          <BadgeCheck className="h-4 w-4 text-emerald-600" />
                        </div>

                        <p className="mt-1 text-sm text-blue-600">
                          {doctor.specialization || "Medical Doctor"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Verified
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-6 space-y-3">
                    {doctor.clinic_name && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <BriefcaseMedical className="h-4 w-4 text-slate-400" />
                        <span>{doctor.clinic_name}</span>
                      </div>
                    )}

                    {doctor.clinic_address && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span>{doctor.clinic_address}</span>
                      </div>
                    )}

                    {doctor.experience_years !== null && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <BriefcaseMedical className="h-4 w-4 text-slate-400" />

                        <span>
                          {doctor.experience_years} years experience
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {doctor.bio && (
                    <p className="mt-5 text-sm leading-6 text-slate-500">
                      {doctor.bio}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => handleViewProfile(doctor)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      View Profile

                      <ChevronRight className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenBooking(doctor)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Book Appointment

                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          DOCTOR PROFILE MODAL
      ====================================================== */}

      {profileDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Doctor Profile
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {profileDoctor.full_name}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setProfileDoctor(null)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[70vh] overflow-y-auto p-6">
              {profileLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading doctor profile...
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Doctor identity */}
                  <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                      <Stethoscope className="h-7 w-7 text-blue-600" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900">
                          {profileDoctor.full_name}
                        </h3>

                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                      </div>

                      <p className="mt-1 text-sm text-blue-600">
                        {profileDoctor.specialization ||
                          "Medical Doctor"}
                      </p>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {profileDoctor.clinic_name && (
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Clinic
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {profileDoctor.clinic_name}
                        </p>
                      </div>
                    )}

                    {profileDoctor.experience_years !== null && (
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Experience
                        </p>

                        <p className="mt-2 text-sm font-semibold text-slate-800">
                          {profileDoctor.experience_years} years
                        </p>
                      </div>
                    )}

                    {profileDoctor.clinic_address && (
                      <div className="rounded-2xl border border-slate-200 p-4 sm:col-span-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Clinic Address
                        </p>

                        <div className="mt-2 flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />

                          <p className="text-sm font-semibold text-slate-800">
                            {profileDoctor.clinic_address}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profileDoctor.bio && (
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        About the Doctor
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {profileDoctor.bio}
                      </p>
                    </div>
                  )}

                  {/* Book */}
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDoctor(null);
                      handleOpenBooking(profileDoctor);
                    }}
                    className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Book Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================
          BOOK APPOINTMENT MODAL
      ====================================================== */}

      {bookingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Appointment
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Book Consultation
                </h2>
              </div>

              <button
                type="button"
                onClick={closeBooking}
                disabled={booking}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5 p-6">
              {bookingSuccess ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900">
                    Appointment Booked
                  </h3>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                    Your consultation with{" "}
                    <span className="font-semibold text-slate-700">
                      {bookingDoctor.full_name}
                    </span>{" "}
                    has been scheduled successfully.
                  </p>

                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-left">
                    <div className="flex items-center gap-3">
                      <UserRound className="h-4 w-4 text-slate-400" />

                      <p className="text-sm text-slate-600">
                        Patient:{" "}
                        <span className="font-semibold text-slate-800">
                          {patient?.full_name}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      <p className="text-sm text-slate-600">
                        Date:{" "}
                        <span className="font-semibold text-slate-800">
                          {scheduledDate}
                        </span>
                      </p>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <Clock3 className="h-4 w-4 text-slate-400" />

                      <p className="text-sm text-slate-600">
                        Time:{" "}
                        <span className="font-semibold text-slate-800">
                          {scheduledTime}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeBooking}
                    className="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Selected Doctor */}
                  <div className="rounded-2xl bg-blue-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                        <Stethoscope className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {bookingDoctor.full_name}
                        </p>

                        <p className="text-xs text-blue-600">
                          {bookingDoctor.specialization ||
                            "Medical Doctor"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Patient */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Patient
                    </label>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                      <UserRound className="h-4 w-4 text-slate-400" />

                      <span className="text-sm font-medium text-slate-800">
                        {patient?.full_name || "Patient unavailable"}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Appointment Date
                    </label>

                    <div className="relative">
                      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) =>
                          setScheduledDate(e.target.value)
                        }
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Appointment Time
                    </label>

                    <div className="relative">
                      <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) =>
                          setScheduledTime(e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Reason for Consultation
                    </label>

                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Routine health consultation"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Error */}
                  {bookingError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 p-3">
                      <p className="text-sm font-medium text-red-600">
                        {bookingError}
                      </p>
                    </div>
                  )}

                  {/* Confirm */}
                  <button
                    type="button"
                    onClick={handleBookAppointment}
                    disabled={booking || !patient}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {booking ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Booking Appointment...
                      </>
                    ) : (
                      <>
                        Confirm Appointment
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}