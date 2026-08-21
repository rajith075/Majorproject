"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  MapPin,
  Smartphone,
  ShieldAlert,
  Wifi,
  WifiOff,
} from "lucide-react";

import { usePatientStore } from "@/store/patient-store";
import { createEmergencyAlert } from "@/services/api/emergency";

export default function FallDetectionPage() {
  const patient = usePatientStore((state) => state.patient);

  const [monitoring, setMonitoring] = useState(false);
  const [sensorSupported, setSensorSupported] = useState(true);
  const [gpsStatus, setGpsStatus] = useState("Waiting");
  const [lastAcceleration, setLastAcceleration] = useState(0);
  const [message, setMessage] = useState(
    "Start monitoring to activate fall detection."
  );

  const monitoringRef = useRef(false);
  const cooldownRef = useRef(false);

  // ==========================================================
  // START MONITORING
  // ==========================================================

  const startMonitoring = async () => {
    if (!patient?.id) {
      setMessage("Patient information is not available.");
      return;
    }

    // iPhone/iPad permission handling if applicable.
    const DeviceMotionEventClass = window.DeviceMotionEvent as any;

    if (
      DeviceMotionEventClass &&
      typeof DeviceMotionEventClass.requestPermission === "function"
    ) {
      try {
        const permission =
          await DeviceMotionEventClass.requestPermission();

        if (permission !== "granted") {
          setMessage(
            "Motion sensor permission was denied."
          );
          return;
        }
      } catch (error) {
        console.error(
          "Motion permission error:",
          error
        );

        setMessage(
          "Unable to access motion sensors."
        );

        return;
      }
    }

    if (!("DeviceMotionEvent" in window)) {
      setSensorSupported(false);
      setMessage(
        "This browser does not support motion sensors."
      );
      return;
    }

    try {
      window.addEventListener(
        "devicemotion",
        handleMotion
      );

      monitoringRef.current = true;
      setMonitoring(true);

      setMessage(
        "Fall detection is active. Keep this page open."
      );
    } catch (error) {
      console.error(
        "Failed to start motion monitoring:",
        error
      );

      setMessage(
        "Unable to start motion monitoring."
      );
    }
  };

  // ==========================================================
  // STOP MONITORING
  // ==========================================================

  const stopMonitoring = () => {
    window.removeEventListener(
      "devicemotion",
      handleMotion
    );

    monitoringRef.current = false;
    setMonitoring(false);

    setMessage(
      "Fall detection has been stopped."
    );
  };

  // ==========================================================
  // MOTION SENSOR
  // ==========================================================

  const handleMotion = (event: DeviceMotionEvent) => {
    if (!monitoringRef.current) return;

    const acceleration =
      event.accelerationIncludingGravity;

    if (!acceleration) return;

    const x = acceleration.x ?? 0;
    const y = acceleration.y ?? 0;
    const z = acceleration.z ?? 0;

    const magnitude = Math.sqrt(
      x * x +
        y * y +
        z * z
    );

    setLastAcceleration(
      Number(magnitude.toFixed(2))
    );

    /*
     * Basic prototype threshold.
     *
     * Normal gravity is approximately 9.8 m/s².
     * A sudden large acceleration can indicate
     * a possible fall.
     */
    if (
      magnitude > 20 &&
      !cooldownRef.current
    ) {
      handlePossibleFall();
    }
  };

  // ==========================================================
  // POSSIBLE FALL
  // ==========================================================

  const handlePossibleFall = async () => {
    if (!patient?.id) return;

    cooldownRef.current = true;

    setMessage(
      "⚠️ Possible fall detected. Getting location..."
    );

    console.log(
      "🚨 POSSIBLE FALL DETECTED"
    );

    try {
      const position =
        await getCurrentLocation();

      const latitude =
        position?.coords.latitude ?? null;

      const longitude =
        position?.coords.longitude ?? null;

      setGpsStatus(
        latitude !== null
          ? "Location received"
          : "Location unavailable"
      );

      // ======================================================
      // CREATE EMERGENCY ALERT
      // ======================================================

      const alert =
        await createEmergencyAlert({
          patient_id: patient.id,
          event_type: "FALL",
          latitude,
          longitude,
        });

      console.log(
        "🚨 EMERGENCY ALERT CREATED:",
        alert
      );

      setMessage(
        "🚨 Fall alert sent successfully."
      );
    } catch (error) {
      console.error(
        "❌ FALL ALERT FAILED:",
        error
      );

      setMessage(
        "Fall detected, but the emergency alert could not be sent."
      );
    }

    /*
     * Prevent multiple alerts from being
     * created continuously while the phone
     * is still moving.
     */
    setTimeout(() => {
      cooldownRef.current = false;

      if (monitoringRef.current) {
        setMessage(
          "Fall detection is active."
        );
      }
    }, 15000);
  };

  // ==========================================================
  // GPS
  // ==========================================================

  const getCurrentLocation =
    (): Promise<GeolocationPosition | null> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          setGpsStatus(
            "GPS not supported"
          );

          resolve(null);
          return;
        }

        setGpsStatus(
          "Getting location..."
        );

        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(position);
          },
          (error) => {
            console.error(
              "GPS ERROR:",
              error
            );

            setGpsStatus(
              "Location unavailable"
            );

            resolve(null);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 5000,
          }
        );
      });
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
    <div className="space-y-8">

      {/* HEADER */}

      <div className="flex items-center gap-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
          <ShieldAlert size={32} />
        </div>

        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Fall Detection
          </h1>

          <p className="mt-1 text-lg text-slate-500">
            Smartphone-based emergency monitoring
          </p>
        </div>

      </div>

      {/* PATIENT */}

      <div className="rounded-[28px] border border-violet-100 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-4">

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
            <Smartphone
              className="text-violet-600"
              size={24}
            />
          </div>

          <div>

            <p className="text-sm text-slate-500">
              Monitoring Patient
            </p>

            <p className="text-xl font-bold text-slate-900">
              {patient?.full_name ||
                "No patient loaded"}
            </p>

          </div>

        </div>

      </div>

      {/* STATUS */}

      <div
        className={`rounded-[32px] border p-8 shadow-sm ${
          monitoring
            ? "border-emerald-200 bg-emerald-50"
            : "border-slate-200 bg-white"
        }`}
      >

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-5">

            <div
              className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                monitoring
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <Activity size={30} />
            </div>

            <div>

              <p className="text-sm font-medium text-slate-500">
                Monitoring Status
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                {monitoring
                  ? "Monitoring Active"
                  : "Monitoring Off"}
              </h2>

            </div>

          </div>

          <div
            className={`h-4 w-4 rounded-full ${
              monitoring
                ? "animate-pulse bg-emerald-500"
                : "bg-slate-300"
            }`}
          />

        </div>

        {/* BUTTON */}

        <button
          onClick={
            monitoring
              ? stopMonitoring
              : startMonitoring
          }
          disabled={!patient?.id}
          className={`mt-8 w-full rounded-2xl px-6 py-4 text-lg font-bold text-white shadow-lg transition ${
            monitoring
              ? "bg-red-500 hover:bg-red-600"
              : "bg-violet-600 hover:bg-violet-700"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {monitoring
            ? "Stop Fall Detection"
            : "Start Fall Detection"}
        </button>

      </div>

      {/* SENSOR DATA */}

      <div className="grid gap-5 md:grid-cols-2">

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            <Activity
              className="text-violet-600"
              size={22}
            />

            <h3 className="font-bold text-slate-900">
              Motion Sensor
            </h3>

          </div>

          <p className="mt-4 text-sm text-slate-500">
            Current acceleration
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            {lastAcceleration} m/s²
          </p>

          <p className="mt-2 text-sm text-slate-500">
            {sensorSupported
              ? "Sensor available"
              : "Sensor unavailable"}
          </p>

        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center gap-3">

            {gpsStatus ===
            "Location received" ? (
              <MapPin
                className="text-emerald-600"
                size={22}
              />
            ) : (
              <WifiOff
                className="text-slate-500"
                size={22}
              />
            )}

            <h3 className="font-bold text-slate-900">
              GPS Location
            </h3>

          </div>

          <p className="mt-4 text-sm text-slate-500">
            Status
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {gpsStatus}
          </p>

        </div>

      </div>

      {/* MESSAGE */}

      <div className="rounded-[28px] border border-violet-100 bg-violet-50 p-6">

        <div className="flex items-start gap-4">

          <CheckCircle2
            className="mt-1 text-violet-600"
            size={22}
          />

          <div>

            <h3 className="font-bold text-slate-900">
              System Status
            </h3>

            <p className="mt-1 text-sm text-slate-600">
              {message}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}