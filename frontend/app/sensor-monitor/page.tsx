"use client";

import { useEffect, useRef, useState } from "react";

type SensorValues = {
  x: number;
  y: number;
  z: number;
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

  // Used for fall detection timing
  const impactDetectedRef = useRef(false);
  const impactTimeRef = useRef(0);

  const addLog = (message: string) => {
    setEventLog((previous) => [
      `${new Date().toLocaleTimeString()} - ${message}`,
      ...previous.slice(0, 4),
    ]);
  };

  const handleMotion = (event: DeviceMotionEvent) => {
    const acceleration =
      event.accelerationIncludingGravity;

    const rotation = event.rotationRate;

    // -----------------------------
    // ACCELEROMETER
    // -----------------------------

    const ax = acceleration?.x ?? 0;
    const ay = acceleration?.y ?? 0;
    const az = acceleration?.z ?? 0;

    const accelerationMagnitude = Math.sqrt(
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
      accelerationMagnitude
    );

    // -----------------------------
    // GYROSCOPE
    // -----------------------------

    const gx = rotation?.alpha ?? 0;
    const gy = rotation?.beta ?? 0;
    const gz = rotation?.gamma ?? 0;

    const gyroMagnitude = Math.sqrt(
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
      gyroMagnitude
    );

    // -----------------------------
    // BASIC FALL DETECTION
    // -----------------------------

    /*
      This is ONLY a prototype detector.

      We are looking for:

      1. Sudden acceleration / impact
      2. High rotational movement
      3. Possible inactivity afterwards
    */

    const IMPACT_THRESHOLD = 20;
    const ROTATION_THRESHOLD = 100;

    if (
      accelerationMagnitude >
      IMPACT_THRESHOLD
    ) {
      impactDetectedRef.current = true;
      impactTimeRef.current =
        Date.now();

      setFallStatus(
        "⚠️ Possible impact detected"
      );

      addLog(
        `Impact detected | Acc: ${accelerationMagnitude.toFixed(
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
        gyroMagnitude >
        ROTATION_THRESHOLD
      ) {
        setFallStatus(
          "⚠️ High rotation after impact"
        );

        addLog(
          `High rotation | Gyro: ${gyroMagnitude.toFixed(
            2
          )}`
        );
      }
    }

    /*
      Reset the impact state after
      a few seconds.
    */

    if (
      impactDetectedRef.current &&
      Date.now() -
        impactTimeRef.current >
        5000
    ) {
      impactDetectedRef.current = false;

      setFallStatus(
        "Monitoring"
      );
    }
  };

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

      // Motion permission
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

      // Orientation permission
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

  useEffect(() => {
    return () => {
      window.removeEventListener(
        "devicemotion",
        handleMotion
      );
    };
  }, []);

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

        {/* STATUS */}

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

        {/* FALL STATUS */}

        <div className="rounded-2xl bg-white p-6 shadow">

          <p className="text-sm text-slate-500">
            Fall Detection
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {fallStatus}
          </p>

        </div>

        {/* ACCELEROMETER */}

        <SensorCard
          title="📊 Accelerometer"
          description="Acceleration including gravity"
          values={[
            ["X", accelerometer.x],
            ["Y", accelerometer.y],
            ["Z", accelerometer.z],
          ]}
        />

        {/* ACCELERATION MAGNITUDE */}

        <MagnitudeCard
          title="⚡ Acceleration Magnitude"
          value={accelerationMagnitude}
          unit="m/s²"
        />

        {/* GYROSCOPE */}

        <SensorCard
          title="🔄 Gyroscope"
          description="Angular rotation rate"
          values={[
            ["X", gyroscope.x],
            ["Y", gyroscope.y],
            ["Z", gyroscope.z],
          ]}
        />

        {/* GYRO MAGNITUDE */}

        <MagnitudeCard
          title="🌀 Gyroscope Magnitude"
          value={gyroMagnitude}
          unit="°/s"
        />

        {/* EVENT LOG */}

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
    </main>
  );
}

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