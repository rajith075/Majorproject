"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Activity,
  HeartPulse,
  Droplets,
  Thermometer,
  Wind,
  Moon,
  Footprints,
  UserRound,
  Phone,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Stethoscope,
  Pill,
  FileText,
} from "lucide-react";

import {
  getDoctorPatient,
  getDoctorVitalHistory,
  DoctorPatient,
  DoctorVitalLog,
} from "@/services/api/doctor";

interface WeeklySummary {
  weekLabel: string;
  startDate: string;
  endDate: string;

  heartRate: number | null;
  systolicBP: number | null;
  diastolicBP: number | null;
  spo2: number | null;
  temperature: number | null;
  respiratoryRate: number | null;
  sleepHours: number | null;
  activitySteps: number | null;
}

function average(values: (number | null)[]) {
  const valid = values.filter(
    (value): value is number =>
      value !== null && Number.isFinite(value)
  );

  if (!valid.length) return null;

  return valid.reduce((sum, value) => sum + value, 0) / valid.length;
}

function formatNumber(
  value: number | null,
  decimals = 1
) {
  if (value === null) return "—";

  return value.toFixed(decimals);
}

function getWeekStart(date: Date) {
  const result = new Date(date);
  const day = result.getDay();

  const difference = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + difference);
  result.setHours(0, 0, 0, 0);

  return result;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function buildWeeklySummaries(
  vitals: DoctorVitalLog[]
): WeeklySummary[] {
  const groups = new Map<
    string,
    {
      start: Date;
      records: DoctorVitalLog[];
    }
  >();

  vitals.forEach((vital) => {
    const date = new Date(vital.created_at);
    const start = getWeekStart(date);
    const key = start.toISOString().slice(0, 10);

    if (!groups.has(key)) {
      groups.set(key, {
        start,
        records: [],
      });
    }

    groups.get(key)!.records.push(vital);
  });

  return Array.from(groups.values())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((group) => {
      const end = new Date(group.start);
      end.setDate(end.getDate() + 6);

      const records = group.records;

      return {
        weekLabel: `${formatShortDate(
          group.start
        )} – ${formatShortDate(end)}`,

        startDate: group.start.toISOString(),
        endDate: end.toISOString(),

        heartRate: average(
          records.map((item) => item.heart_rate)
        ),

        systolicBP: average(
          records.map((item) => item.systolic_bp)
        ),

        diastolicBP: average(
          records.map((item) => item.diastolic_bp)
        ),

        spo2: average(
          records.map((item) => item.spo2)
        ),

        temperature: average(
          records.map((item) => item.temperature)
        ),

        respiratoryRate: average(
          records.map((item) => item.respiratory_rate)
        ),

        sleepHours: average(
          records.map((item) => item.sleep_hours)
        ),

        activitySteps: average(
          records.map((item) => item.activity_steps)
        ),
      };
    });
}

function VitalCard({
  icon,
  title,
  value,
  unit,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  unit: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-400">
          Latest
        </span>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {title}
      </p>

      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900">
          {value}
        </span>

        <span className="text-sm text-slate-400">
          {unit}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function TrendBar({
  label,
  value,
  unit,
  explanation,
}: {
  label: string;
  value: string;
  unit: string;
  explanation: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">
            {label}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Weekly average
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-slate-900">
            {value}
          </p>

          <p className="text-xs text-slate-400">
            {unit}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        {explanation}
      </p>
    </div>
  );
}

export default function DoctorHealthReportPage() {
  const [patient, setPatient] =
    useState<DoctorPatient | null>(null);

  const [vitals, setVitals] =
    useState<DoctorVitalLog[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);

        const patientData = await getDoctorPatient();

        if (!patientData) {
          setError("No patient is currently assigned.");
          return;
        }

        setPatient(patientData);

        const vitalData =
          await getDoctorVitalHistory(patientData.id);

        setVitals(vitalData || []);
      } catch (err) {
        console.error(
          "Failed to load health report:",
          err
        );

        setError(
          "Unable to load the patient's health report."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  const latestVital = useMemo(() => {
    if (!vitals.length) return null;

    return [...vitals].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];
  }, [vitals]);

  const weeklySummaries = useMemo(
    () => buildWeeklySummaries(vitals),
    [vitals]
  );

  const latestWeek =
    weeklySummaries[weeklySummaries.length - 1] || null;

  const previousWeek =
    weeklySummaries.length > 1
      ? weeklySummaries[weeklySummaries.length - 2]
      : null;

  const trendText = (
    current: number | null,
    previous: number | null,
    label: string
  ) => {
    if (
      current === null ||
      previous === null
    ) {
      return `Not enough historical data is available to describe the ${label.toLowerCase()} trend.`;
    }

    const difference = current - previous;

    if (Math.abs(difference) < 0.5) {
      return `${label} remained relatively stable compared with the previous week.`;
    }

    if (difference > 0) {
      return `${label} increased by approximately ${Math.abs(
        difference
      ).toFixed(1)} compared with the previous week.`;
    }

    return `${label} decreased by approximately ${Math.abs(
      difference
    ).toFixed(1)} compared with the previous week.`;
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <Activity className="mx-auto h-10 w-10 animate-pulse text-blue-600" />

            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Preparing Health Report
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Loading the patient's recorded health information...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !patient) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-sm">
            <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />

            <h1 className="mt-4 text-xl font-bold text-slate-900">
              Health Report Unavailable
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {error || "Patient information could not be loaded."}
            </p>

            <button
              type="button"
              onClick={() => window.history.back()}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Doctor Dashboard
            </button>

            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <FileText className="h-4 w-4" />
              Patient Health Report
            </div>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {patient.full_name}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Comprehensive health summary, current vitals and
              recorded historical trends.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Stethoscope className="h-5 w-5 text-blue-600" />

              <div>
                <p className="text-xs text-slate-400">
                  Report generated
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* PATIENT INFORMATION */}
        {/* ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50">
              <UserRound className="h-6 w-6 text-violet-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Patient Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Basic identification and care information.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">
                Full Name
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.full_name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Age / Gender
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.age} years • {patient.gender}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Blood Group
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.blood_group || "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Patient Contact
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.phone || "Not recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Medical Conditions
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.medical_conditions ||
                  "No conditions recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Allergies
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.allergies || "None recorded"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Caregiver
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.assigned_caregiver ||
                  "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Emergency Contact
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient.emergency_contact_name ||
                  "Not recorded"}
              </p>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* MEDICAL SUMMARY */}
        {/* ================================================= */}

        <section className="grid gap-5 lg:grid-cols-2">

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-3">
              <HeartPulse className="h-5 w-5 text-rose-600" />

              <h2 className="text-xl font-bold text-slate-900">
                Medical Summary
              </h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Existing Conditions
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {patient.medical_conditions ||
                    "No medical conditions recorded."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Allergies
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {patient.allergies ||
                    "No allergies recorded."}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-400">
                  Current Medications
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-700">
                  {patient.medications ||
                    "No medications recorded."}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />

              <h2 className="text-xl font-bold text-slate-900">
                Emergency & Care
              </h2>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs text-slate-400">
                  Emergency Contact
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {patient.emergency_contact_name ||
                    "Not recorded"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {patient.emergency_contact_phone ||
                    "Phone not recorded"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Relationship
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {patient.relationship ||
                    "Not recorded"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Hospital
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {patient.hospital ||
                    "Not recorded"}
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* ================================================= */}
        {/* CURRENT VITALS */}
        {/* ================================================= */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Current Vitals
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Most recently recorded measurements for this patient.
            </p>
          </div>

          {!latestVital ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <Activity className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                No vital readings have been recorded yet.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <VitalCard
                  icon={<HeartPulse className="h-5 w-5" />}
                  title="Heart Rate"
                  value={formatNumber(
                    latestVital.heart_rate
                  )}
                  unit="bpm"
                  description="Latest recorded heart rate."
                />

                <VitalCard
                  icon={<Activity className="h-5 w-5" />}
                  title="Blood Pressure"
                  value={
                    latestVital.systolic_bp !== null &&
                    latestVital.diastolic_bp !== null
                      ? `${formatNumber(
                          latestVital.systolic_bp,
                          0
                        )}/${formatNumber(
                          latestVital.diastolic_bp,
                          0
                        )}`
                      : "—"
                  }
                  unit="mmHg"
                  description="Latest systolic and diastolic reading."
                />

                <VitalCard
                  icon={<Droplets className="h-5 w-5" />}
                  title="SpO₂"
                  value={formatNumber(
                    latestVital.spo2
                  )}
                  unit="%"
                  description="Latest recorded oxygen saturation."
                />

                <VitalCard
                  icon={<Thermometer className="h-5 w-5" />}
                  title="Temperature"
                  value={formatNumber(
                    latestVital.temperature
                  )}
                  unit="°F"
                  description="Latest recorded body temperature."
                />

                <VitalCard
                  icon={<Wind className="h-5 w-5" />}
                  title="Respiratory Rate"
                  value={formatNumber(
                    latestVital.respiratory_rate
                  )}
                  unit="/min"
                  description="Latest recorded respiratory rate."
                />

                <VitalCard
                  icon={<Moon className="h-5 w-5" />}
                  title="Sleep"
                  value={formatNumber(
                    latestVital.sleep_hours
                  )}
                  unit="hrs"
                  description="Sleep duration from the latest record."
                />

                <VitalCard
                  icon={<Footprints className="h-5 w-5" />}
                  title="Activity"
                  value={formatNumber(
                    latestVital.activity_steps,
                    0
                  )}
                  unit="steps"
                  description="Recorded activity from the latest entry."
                />

                <VitalCard
                  icon={<UserRound className="h-5 w-5" />}
                  title="BMI"
                  value={formatNumber(
                    patient.bmi
                  )}
                  unit=""
                  description="BMI from the patient's current profile."
                />

              </div>

              <p className="mt-4 text-xs text-slate-400">
                Latest reading recorded on{" "}
                {new Date(
                  latestVital.created_at
                ).toLocaleString("en-IN")}
                . Measurements are presented as recorded and should
                be interpreted in the patient's clinical context.
              </p>
            </>
          )}
        </section>

        {/* ================================================= */}
        {/* WEEKLY TREND SUMMARY */}
        {/* ================================================= */}

        <section>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Weekly Health Trends
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Weekly averages calculated from the patient's recorded
              vital measurements.
            </p>
          </div>

          {!weeklySummaries.length ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center">
              <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />

              <p className="mt-3 text-sm text-slate-500">
                Historical data is not available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Latest week */}
              {latestWeek && (
                <div className="rounded-3xl border border-blue-100 bg-blue-50/40 p-6 lg:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                        Latest Week
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-slate-900">
                        {latestWeek.weekLabel}
                      </h3>
                    </div>

                    <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm">
                      {vitals.length} recorded reading
                      {vitals.length === 1 ? "" : "s"} total
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <TrendBar
                      label="Heart Rate"
                      value={formatNumber(
                        latestWeek.heartRate
                      )}
                      unit="bpm"
                      explanation={trendText(
                        latestWeek.heartRate,
                        previousWeek?.heartRate ?? null,
                        "Heart rate"
                      )}
                    />

                    <TrendBar
                      label="Systolic BP"
                      value={formatNumber(
                        latestWeek.systolicBP,
                        0
                      )}
                      unit="mmHg"
                      explanation={trendText(
                        latestWeek.systolicBP,
                        previousWeek?.systolicBP ?? null,
                        "Systolic blood pressure"
                      )}
                    />

                    <TrendBar
                      label="Diastolic BP"
                      value={formatNumber(
                        latestWeek.diastolicBP,
                        0
                      )}
                      unit="mmHg"
                      explanation={trendText(
                        latestWeek.diastolicBP,
                        previousWeek?.diastolicBP ?? null,
                        "Diastolic blood pressure"
                      )}
                    />

                    <TrendBar
                      label="SpO₂"
                      value={formatNumber(
                        latestWeek.spo2
                      )}
                      unit="%"
                      explanation={trendText(
                        latestWeek.spo2,
                        previousWeek?.spo2 ?? null,
                        "Oxygen saturation"
                      )}
                    />

                    <TrendBar
                      label="Temperature"
                      value={formatNumber(
                        latestWeek.temperature
                      )}
                      unit="°F"
                      explanation={trendText(
                        latestWeek.temperature,
                        previousWeek?.temperature ?? null,
                        "Temperature"
                      )}
                    />

                    <TrendBar
                      label="Respiratory Rate"
                      value={formatNumber(
                        latestWeek.respiratoryRate
                      )}
                      unit="/min"
                      explanation={trendText(
                        latestWeek.respiratoryRate,
                        previousWeek?.respiratoryRate ?? null,
                        "Respiratory rate"
                      )}
                    />

                    <TrendBar
                      label="Sleep"
                      value={formatNumber(
                        latestWeek.sleepHours
                      )}
                      unit="hrs"
                      explanation={trendText(
                        latestWeek.sleepHours,
                        previousWeek?.sleepHours ?? null,
                        "Sleep duration"
                      )}
                    />

                    <TrendBar
                      label="Activity"
                      value={formatNumber(
                        latestWeek.activitySteps,
                        0
                      )}
                      unit="steps"
                      explanation={trendText(
                        latestWeek.activitySteps,
                        previousWeek?.activitySteps ?? null,
                        "Activity"
                      )}
                    />

                  </div>
                </div>
              )}

              {/* All weeks */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600" />

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Weekly History
                    </h3>

                    <p className="text-xs text-slate-500">
                      Historical weekly averages.
                    </p>
                  </div>
                </div>

                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs text-slate-400">
                        <th className="pb-3 pr-5">
                          Week
                        </th>

                        <th className="pb-3 pr-5">
                          HR
                        </th>

                        <th className="pb-3 pr-5">
                          BP
                        </th>

                        <th className="pb-3 pr-5">
                          SpO₂
                        </th>

                        <th className="pb-3 pr-5">
                          Temp
                        </th>

                        <th className="pb-3 pr-5">
                          Resp.
                        </th>

                        <th className="pb-3 pr-5">
                          Sleep
                        </th>

                        <th className="pb-3">
                          Activity
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {weeklySummaries
                        .slice()
                        .reverse()
                        .map((week) => (
                          <tr
                            key={week.startDate}
                            className="border-b border-slate-100 last:border-0"
                          >
                            <td className="py-4 pr-5 font-semibold text-slate-800">
                              {week.weekLabel}
                            </td>

                            <td className="py-4 pr-5 text-slate-600">
                              {formatNumber(
                                week.heartRate
                              )}{" "}
                              bpm
                            </td>

                            <td className="py-4 pr-5 text-slate-600">
                              {formatNumber(
                                week.systolicBP,
                                0
                              )}
                              /
                              {formatNumber(
                                week.diastolicBP,
                                0
                              )}
                            </td>

                            <td className="py-4 pr-5 text-slate-600">
                              {formatNumber(
                                week.spo2
                              )}%
                            </td>

                            <td className="py-4 pr-5 text-slate-600">
                              {formatNumber(
                                week.temperature
                              )}°F
                            </td>

                            <td className="py-4 pr-5 text-slate-600">
                              {formatNumber(
                                week.respiratoryRate
                              )}
                            </td>

                            <td className="py-4 pr-5 text-slate-600">
                              {formatNumber(
                                week.sleepHours
                              )}{" "}
                              hrs
                            </td>

                            <td className="py-4 text-slate-600">
                              {formatNumber(
                                week.activitySteps,
                                0
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ================================================= */}
        {/* HEALTH ANALYSIS */}
        {/* ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <Activity className="h-6 w-6 text-emerald-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Health Trend Analysis
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Automatic descriptive observations based on recorded
                weekly changes.
              </p>
            </div>
          </div>

          {latestWeek ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <HeartPulse className="h-4 w-4 text-rose-500" />

                  <h3 className="font-semibold text-slate-900">
                    Cardiovascular Measurements
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {trendText(
                    latestWeek.heartRate,
                    previousWeek?.heartRate ?? null,
                    "Heart rate"
                  )}{" "}
                  {trendText(
                    latestWeek.systolicBP,
                    previousWeek?.systolicBP ?? null,
                    "Systolic blood pressure"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-blue-500" />

                  <h3 className="font-semibold text-slate-900">
                    Oxygenation
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {trendText(
                    latestWeek.spo2,
                    previousWeek?.spo2 ?? null,
                    "Oxygen saturation"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <Moon className="h-4 w-4 text-indigo-500" />

                  <h3 className="font-semibold text-slate-900">
                    Sleep & Recovery
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {trendText(
                    latestWeek.sleepHours,
                    previousWeek?.sleepHours ?? null,
                    "Sleep duration"
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <Footprints className="h-4 w-4 text-emerald-500" />

                  <h3 className="font-semibold text-slate-900">
                    Daily Activity
                  </h3>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {trendText(
                    latestWeek.activitySteps,
                    previousWeek?.activitySteps ?? null,
                    "Activity"
                  )}
                </p>
              </div>

            </div>
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              More recorded data is needed to generate a trend
              analysis.
            </p>
          )}
        </section>

        {/* ================================================= */}
        {/* IMPORTANT READINGS */}
        {/* ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Important Recorded Readings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Readings that may warrant clinical review based on
                commonly used adult reference thresholds.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">

            {latestVital?.spo2 !== null &&
            latestVital?.spo2 !== undefined &&
            latestVital.spo2 < 95 ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="font-semibold text-amber-900">
                    SpO₂ reading below 95%
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    The latest recorded oxygen saturation is{" "}
                    {latestVital.spo2}%. This reading should be
                    interpreted in the patient's clinical context.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                <div>
                  <p className="font-semibold text-emerald-900">
                    No SpO₂ attention flag
                  </p>

                  <p className="mt-1 text-sm text-emerald-800">
                    The latest recorded SpO₂ is not below the
                    report's attention threshold.
                  </p>
                </div>
              </div>
            )}

            {latestVital?.systolic_bp !== null &&
            latestVital?.systolic_bp !== undefined &&
            latestVital.systolic_bp >= 140 ? (
              <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <div>
                  <p className="font-semibold text-amber-900">
                    Elevated systolic blood pressure reading
                  </p>

                  <p className="mt-1 text-sm text-amber-800">
                    The latest systolic value is{" "}
                    {latestVital.systolic_bp} mmHg. Review the
                    broader trend and clinical context rather than
                    relying on a single reading.
                  </p>
                </div>
              </div>
            ) : null}

          </div>
        </section>

        {/* ================================================= */}
        {/* MEDICATION */}
        {/* ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
              <Pill className="h-6 w-6 text-amber-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Medication Summary
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current medication information recorded for the patient.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="text-sm leading-6 text-slate-700">
              {patient.medications ||
                "No medication information is currently recorded for this patient."}
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* DOCTOR NOTES */}
        {/* ================================================= */}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Clinical Notes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Existing notes recorded for the patient.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {patient.notes ||
                "No clinical notes have been recorded yet."}
            </p>
          </div>
        </section>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div className="pb-8 text-center text-xs text-slate-400">
          ElderlyCare • Patient Health Report
        </div>

      </div>
    </main>
  );
}