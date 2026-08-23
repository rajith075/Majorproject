"use client";

import { useEffect, useRef, useState } from "react";
import { createEmergencyAlert } from "@/services/api/emergency";

type SensorValues = {
  x: number;
  y: number;
  z: number;
};

type SensorSample = {
  timestamp: string;
  acc_x: number;
  acc_y: number;
  acc_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  activity: string;
};

export default function SensorMonitorPage() {
  const [started, setStarted] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");

  const [accelerometer, setAccelerometer] =
    useState<SensorValues>({
      x: 0,
      y: 0,
      z: 0,
    });

  const [gyroscope, setGyroscope] =
    useState<SensorValues>({
      x: 0,
      y: 0,
      z: 0,
    });

  const [accelerationMagnitude, setAccelerationMagnitude] =
    useState(0);

  const [gyroMagnitude, setGyroMagnitude] =
    useState(0);

  const [fallStatus, setFallStatus] =
    useState("Monitoring");

  const [eventLog, setEventLog] =
    useState<string[]>([]);

  // ==========================================================
  // SOS
  // ==========================================================

  const [showSOSConfirmation, setShowSOSConfirmation] =
    useState(false);

  const [sosSent, setSosSent] = useState(false);

  // ==========================================================
  // FALL DETECTION
  // ==========================================================

  const impactDetectedRef = useRef(false);
  const impactTimeRef = useRef(0);

  // ==========================================================
  // SENSOR RECORDING
  // ==========================================================

  const [isRecording, setIsRecording] =
    useState(false);

  const [activity, setActivity] =
    useState("walking");

  const [sampleCount, setSampleCount] =
    useState(0);

  const recordingDataRef =
    useRef<SensorSample[]>([]);

  // ==========================================================
  // EVENT LOG
  // ==========================================================

  const addLog = (message: string) => {
    setEventLog((previous) => [
      `${new Date().toLocaleTimeString()} - ${message}`,
      ...previous.slice(0, 4),
    ]);
  };

  // ==========================================================
  // SOS
  // ==========================================================

  const handleSOS = async () => {
    console.log("🆘 SOS BUTTON PRESSED");

    try {
      await createEmergencyAlert({
        patient_id: 1,
        event_type: "SOS",
        latitude: null,
        longitude: null,
      });

      setSosSent(true);
      setShowSOSConfirmation(false);

      addLog("🆘 HIGH-PRIORITY SOS ALERT SENT");

      setFallStatus("🆘 EMERGENCY SOS SENT");

      setTimeout(() => {
        setSosSent(false);
      }, 5000);
    } catch (err) {
      console.error("SOS error:", err);

      setShowSOSConfirmation(false);

      addLog("❌ Failed to send SOS alert");

      setFallStatus("❌ SOS FAILED — TRY AGAIN");
    }
  };

  // ==========================================================
  // MOTION SENSOR
  // ==========================================================

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration =
      event.accelerationIncludingGravity;

    const rotation = event.rotationRate;

    // --------------------------------------------------------
    // ACCELEROMETER
    // --------------------------------------------------------

    const ax = acceleration?.x ?? 0;
    const ay = acceleration?.y ?? 0;
    const az = acceleration?.z ?? 0;

    const currentAccelerationMagnitude =
      Math.sqrt(
        ax * ax +
          ay * ay +
          az * az
      );

    setAccelerometer({
      x: ax,
      y: ay,
      z: az,
    });

    setAccelerationMagnitude(
      currentAccelerationMagnitude
    );

    // --------------------------------------------------------
    // GYROSCOPE
    // --------------------------------------------------------

    const gx = rotation?.alpha ?? 0;
    const gy = rotation?.beta ?? 0;
    const gz = rotation?.gamma ?? 0;

    const currentGyroMagnitude =
      Math.sqrt(
        gx * gx +
          gy * gy +
          gz * gz
      );

    setGyroscope({
      x: gx,
      y: gy,
      z: gz,
    });

    setGyroMagnitude(
      currentGyroMagnitude
    );

    // ========================================================
    // RECORD SENSOR DATA
    // ========================================================

    if (isRecording) {
      const sample: SensorSample = {
        timestamp:
          new Date().toISOString(),

        acc_x: ax,
        acc_y: ay,
        acc_z: az,

        gyro_x: gx,
        gyro_y: gy,
        gyro_z: gz,

        activity,
      };

      recordingDataRef.current.push(
        sample
      );

      setSampleCount(
        recordingDataRef.current.length
      );
    }

    // ========================================================
    // BASIC FALL DETECTION
    // ========================================================

    const IMPACT_THRESHOLD = 20;
    const ROTATION_THRESHOLD = 100;

    if (
      currentAccelerationMagnitude >
      IMPACT_THRESHOLD
    ) {
      impactDetectedRef.current = true;

      impactTimeRef.current =
        Date.now();

      setFallStatus(
        "⚠️ Possible impact detected"
      );

      addLog(
        `Impact detected | Acc: ${currentAccelerationMagnitude.toFixed(
          2
        )}`
      );
    }

    if (
      impactDetectedRef.current &&
      Date.now() -
        impactTimeRef.current <
        3000
    ) {
      if (
        currentGyroMagnitude >
        ROTATION_THRESHOLD
      ) {
        setFallStatus(
          "⚠️ High rotation after impact"
        );

        addLog(
          `High rotation | Gyro: ${currentGyroMagnitude.toFixed(
            2
          )}`
        );
      }
    }

    // --------------------------------------------------------
    // RESET IMPACT
    // --------------------------------------------------------

    if (
      impactDetectedRef.current &&
      Date.now() -
        impactTimeRef.current >
        5000
    ) {
      impactDetectedRef.current =
        false;

      setFallStatus(
        "Monitoring"
      );
    }
  };

  // ==========================================================
  // START SENSORS
  // ==========================================================

  const startSensors = async () => {
    setError("");

    setStatus(
      "Requesting sensor permission..."
    );

    try {
      const MotionEvent =
        DeviceMotionEvent as typeof DeviceMotionEvent & {
          requestPermission?: () => Promise<
            "granted" | "denied"
          >;
        };

      const OrientationEvent =
        DeviceOrientationEvent as typeof DeviceOrientationEvent & {
          requestPermission?: () => Promise<
            "granted" | "denied"
          >;
        };

      // ------------------------------------------------------
      // MOTION PERMISSION
      // ------------------------------------------------------

      if (
        typeof MotionEvent.requestPermission ===
        "function"
      ) {
        const permission =
          await MotionEvent.requestPermission();

        if (
          permission !== "granted"
        ) {
          throw new Error(
            "Motion sensor permission denied."
          );
        }
      }

      // ------------------------------------------------------
      // ORIENTATION PERMISSION
      // ------------------------------------------------------

      if (
        typeof OrientationEvent.requestPermission ===
        "function"
      ) {
        const permission =
          await OrientationEvent.requestPermission();

        if (
          permission !== "granted"
        ) {
          throw new Error(
            "Orientation sensor permission denied."
          );
        }
      }

      // ------------------------------------------------------
      // LISTENER
      // ------------------------------------------------------

      window.addEventListener(
        "devicemotion",
        handleMotion
      );

      setStarted(true);

      setStatus(
        "Sensors started"
      );

      addLog(
        "Sensor monitoring started"
      );
    } catch (err) {
      console.error(err);

      setStatus(
        "Sensor start failed"
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to access sensors."
      );
    }
  };

  // ==========================================================
  // START RECORDING
  // ==========================================================

  const startRecording = () => {
    if (!started) {
      setError(
        "Start sensor monitoring first."
      );

      return;
    }

    recordingDataRef.current = [];

    setSampleCount(0);

    setIsRecording(true);

    addLog(
      `🔴 Recording started | Activity: ${activity}`
    );
  };

  // ==========================================================
  // STOP RECORDING
  // ==========================================================

  const stopRecording = () => {
    setIsRecording(false);

    const totalSamples =
      recordingDataRef.current.length;

    addLog(
      `⏹ Recording stopped | ${totalSamples} samples`
    );
  };

  // ==========================================================
  // DOWNLOAD CSV
  // ==========================================================

  const downloadCSV = () => {
    const data =
      recordingDataRef.current;

    if (data.length === 0) {
      setError(
        "No recorded sensor data available."
      );

      return;
    }

    const header = [
      "timestamp",
      "acc_x",
      "acc_y",
      "acc_z",
      "gyro_x",
      "gyro_y",
      "gyro_z",
      "activity",
    ];

    const rows = data.map(
      (sample) => [
        sample.timestamp,
        sample.acc_x,
        sample.acc_y,
        sample.acc_z,
        sample.gyro_x,
        sample.gyro_y,
        sample.gyro_z,
        sample.activity,
      ]
    );

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        row.join(",")
      ),
    ].join("\n");

    const blob =
      new Blob([csv], {
        type: "text/csv;charset=utf-8;",
      });

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `elderlycare_${activity}_${Date.now()}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    addLog(
      `📥 CSV downloaded | ${data.length} samples`
    );
  };

  // ==========================================================
  // CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      window.removeEventListener(
        "devicemotion",
        handleMotion
      );
    };
  }, []);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-100 p-5">

      <div className="mx-auto max-w-xl space-y-5">

        {/* HEADER */}

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            📱 ElderlyCare Sensor Monitor
          </h1>

          <p className="mt-2 text-slate-500">
            Real-time fall detection sensor testing
          </p>
        </div>

        {/* SENSOR STATUS */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-sm text-slate-500">
            Sensor Status
          </p>

          <div className="mt-2 flex items-center gap-3">

            <div
              className={`h-3 w-3 rounded-full ${
                started
                  ? "bg-emerald-500"
                  : "bg-slate-300"
              }`}
            />

            <p className="text-xl font-bold">
              {status}
            </p>

          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!started && (
            <button
              type="button"
              onClick={startSensors}
              className="mt-6 w-full rounded-xl bg-violet-600 px-6 py-4 text-lg font-bold text-white shadow-lg active:scale-95"
            >
              🚀 Start Monitoring
            </button>
          )}

        </div>

        {/* ================================================== */}
        {/* SENSOR DATA RECORDER */}
        {/* ================================================== */}

        <div className="rounded-2xl border-2 border-violet-200 bg-white p-6 shadow">

          <h2 className="text-xl font-bold text-slate-900">
            🎙️ Sensor Data Recorder
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Record raw accelerometer and gyroscope data
            for ML dataset creation.
          </p>

          {/* ACTIVITY */}

          <div className="mt-5">

            <label className="text-sm font-semibold text-slate-700">
              Activity / Label
            </label>

            <select
              value={activity}
              onChange={(e) =>
                setActivity(e.target.value)
              }
              disabled={isRecording}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
            >
              <option value="standing">
                Standing
              </option>

              <option value="sitting">
                Sitting
              </option>

              <option value="walking">
                Walking
              </option>

              <option value="running">
                Running
              </option>

              <option value="lying">
                Lying
              </option>

              <option value="stairs">
                Stairs
              </option>

              <option value="sudden_movement">
                Sudden Movement
              </option>

              <option value="fall_like">
                Fall-like Event
              </option>
            </select>

          </div>

          {/* RECORDING STATS */}

          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="rounded-xl bg-slate-100 p-4 text-center">

              <p className="text-sm text-slate-500">
                Recording
              </p>

              <p className="mt-1 text-xl font-bold">
                {isRecording
                  ? "🔴 ACTIVE"
                  : "⚪ STOPPED"}
              </p>

            </div>

            <div className="rounded-xl bg-slate-100 p-4 text-center">

              <p className="text-sm text-slate-500">
                Samples
              </p>

              <p className="mt-1 text-xl font-bold">
                {sampleCount}
              </p>

            </div>

          </div>

          {/* BUTTONS */}

          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              disabled={!started}
              className="mt-5 w-full rounded-xl bg-red-600 px-5 py-4 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              🔴 START RECORDING
            </button>
          ) : (
            <button
              type="button"
              onClick={stopRecording}
              className="mt-5 w-full rounded-xl bg-slate-900 px-5 py-4 font-bold text-white shadow-lg"
            >
              ⏹ STOP RECORDING
            </button>
          )}

          <button
            type="button"
            onClick={downloadCSV}
            disabled={
              recordingDataRef.current.length === 0
            }
            className="mt-3 w-full rounded-xl border-2 border-emerald-500 bg-emerald-50 px-5 py-4 font-bold text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            📥 DOWNLOAD CSV
          </button>

        </div>

        {/* ================================================== */}
        {/* SOS */}
        {/* ================================================== */}

        <div className="rounded-2xl border-2 border-red-200 bg-white p-6 shadow">

          <div className="text-center">

            <div className="text-5xl">
              🆘
            </div>

            <h2 className="mt-3 text-2xl font-bold text-red-700">
              Emergency SOS
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Press this button if you need immediate
              assistance from your caregiver.
            </p>

            {!sosSent ? (
              <button
                type="button"
                onClick={() =>
                  setShowSOSConfirmation(true)
                }
                className="mt-5 w-full rounded-xl bg-red-600 px-6 py-5 text-xl font-bold text-white shadow-lg transition active:scale-95 hover:bg-red-700"
              >
                🆘 SEND SOS ALERT
              </button>
            ) : (
              <div className="mt-5 rounded-xl bg-red-50 p-5">

                <p className="text-xl font-bold text-red-700">
                  🆘 SOS SENT
                </p>

                <p className="mt-2 text-sm text-red-600">
                  Your caregiver has been alerted.
                </p>

              </div>
            )}

          </div>

        </div>

        {/* ================================================== */}
        {/* FALL STATUS */}
        {/* ================================================== */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-sm text-slate-500">
            Fall Detection
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {fallStatus}
          </p>

        </div>

        {/* ================================================== */}
        {/* ACCELEROMETER */}
        {/* ================================================== */}

        <SensorCard
          title="📊 Accelerometer"
          description="Acceleration including gravity"
          values={[
            ["X", accelerometer.x],
            ["Y", accelerometer.y],
            ["Z", accelerometer.z],
          ]}
        />

        <MagnitudeCard
          title="⚡ Acceleration Magnitude"
          value={accelerationMagnitude}
          unit="m/s²"
        />

        {/* ================================================== */}
        {/* GYROSCOPE */}
        {/* ================================================== */}

        <SensorCard
          title="🔄 Gyroscope"
          description="Angular rotation rate"
          values={[
            ["X", gyroscope.x],
            ["Y", gyroscope.y],
            ["Z", gyroscope.z],
          ]}
        />

        <MagnitudeCard
          title="🌀 Gyroscope Magnitude"
          value={gyroMagnitude}
          unit="°/s"
        />

        {/* ================================================== */}
        {/* EVENT LOG */}
        {/* ================================================== */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold">
            📋 Sensor Events
          </h2>

          <div className="mt-4 space-y-2">

            {eventLog.length === 0 ? (
              <p className="text-sm text-slate-500">
                No events yet.
              </p>
            ) : (
              eventLog.map(
                (event, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-slate-100 p-3 text-sm"
                  >
                    {event}
                  </div>
                )
              )
            )}

          </div>

        </div>

      </div>

      {/* ==================================================== */}
      {/* SOS CONFIRMATION */}
      {/* ==================================================== */}

      {showSOSConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5">

          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">

            <div className="text-center">

              <div className="text-6xl">
                🆘
              </div>

              <h2 className="mt-4 text-2xl font-bold text-slate-900">
                Send Emergency SOS?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                This will send a high-priority emergency
                alert to your caregiver.
              </p>

            </div>

            <div className="mt-7 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  setShowSOSConfirmation(false)
                }
                className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-4 font-bold text-slate-700 active:scale-95"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSOS}
                className="rounded-xl bg-red-600 px-4 py-4 font-bold text-white shadow-lg active:scale-95"
              >
                🆘 YES, SEND SOS
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// ==========================================================
// SENSOR CARD
// ==========================================================

function SensorCard({
  title,
  description,
  values,
}: {
  title: string;
  description: string;
  values: [string, number][];
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <h2 className="text-xl font-bold text-slate-900">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

      <div className="mt-5 grid grid-cols-3 gap-3">

        {values.map(
          ([label, value]) => (
            <div
              key={label}
              className="rounded-xl bg-slate-100 p-4 text-center"
            >

              <p className="text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {value.toFixed(2)}
              </p>

            </div>
          )
        )}

      </div>

    </div>
  );
}

// ==========================================================
// MAGNITUDE CARD
// ==========================================================

function MagnitudeCard({
  title,
  value,
  unit,
}: {
  title: string;
  value: number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value.toFixed(2)}
      </p>

      <p className="text-sm text-slate-500">
        {unit}
      </p>

    </div>
  );
}