"use client";

import { useEffect, useState } from "react";
import { Check, Copy, LoaderCircle, PlugZap, Unplug } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  connectDevice,
  disconnectDevice,
  getDeviceConnection,
  type DeviceConnection,
} from "@/services/api/device";

const LIVE_READING_WINDOW_MS = 15_000;

function formatLastSeen(lastSeenAt: string | null, hardwareLive: boolean) {
  if (!lastSeenAt) return "Bridge is waiting for the first Arduino reading.";

  return hardwareLive
    ? `Receiving readings · last one ${new Date(lastSeenAt).toLocaleTimeString("en-IN")}`
    : `Last reading ${new Date(lastSeenAt).toLocaleString("en-IN")} · bridge may be stopped.`;
}

export default function DeviceConnectionControl() {
  const [connection, setConnection] = useState<DeviceConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [newDeviceToken, setNewDeviceToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;
    let requestInFlight = false;

    const loadConnection = async (isInitialLoad = false) => {
      if (requestInFlight) return;
      requestInFlight = true;

      try {
        if (isInitialLoad) setLoading(true);
        const status = await getDeviceConnection();
        if (!cancelled) setConnection(status.connection);
      } catch (requestError) {
        console.error("Unable to load Arduino connection:", requestError);
        if (!cancelled && isInitialLoad) {
          setError("Unable to check the Arduino connection.");
        }
      } finally {
        requestInFlight = false;
        if (!cancelled && isInitialLoad) setLoading(false);
      }
    };

    void loadConnection(true);
    // Connection state cannot change more often than a device heartbeat, so
    // avoid producing a request per second while the dashboard is open.
    const interval = window.setInterval(() => void loadConnection(), 5_000);
    const clock = window.setInterval(() => setNow(Date.now()), 1_000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.clearInterval(clock);
    };
  }, []);

  const handleConnect = async () => {
    setActionLoading(true);
    setError(null);
    setCopied(false);

    try {
      const result = await connectDevice();
      setConnection({
        id: result.connection_id,
        patient_id: result.patient_id,
        patient_name: result.patient_name,
        device_name: result.device_name,
        status: result.status,
        connected_at: result.connected_at,
        last_seen_at: null,
      });
      setNewDeviceToken(result.device_token);
    } catch (requestError) {
      console.error("Unable to connect Arduino:", requestError);
      setError("Could not connect the Arduino. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setActionLoading(true);
    setError(null);

    try {
      await disconnectDevice();
      setConnection(null);
      setNewDeviceToken(null);
    } catch (requestError) {
      console.error("Unable to disconnect Arduino:", requestError);
      setError("Could not disconnect the Arduino. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToken = async () => {
    if (!newDeviceToken) return;

    try {
      await navigator.clipboard.writeText(newDeviceToken);
      setCopied(true);
    } catch (copyError) {
      console.error("Unable to copy device token:", copyError);
      setError("Copy the displayed token manually into backend/.env.");
    }
  };

  const authorized = connection?.status === "connected";
  const hardwareLive = Boolean(
    connection?.last_seen_at &&
      now - new Date(connection.last_seen_at).getTime() < LIVE_READING_WINDOW_MS
  );

  return (
    <div className="rounded-3xl border border-violet-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-3 ${hardwareLive ? "bg-emerald-50" : "bg-violet-50"}`}>
            <PlugZap className={`h-5 w-5 ${hardwareLive ? "text-emerald-600" : "text-violet-600"}`} />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Arduino Device</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {loading
                ? "Checking device connection..."
                : authorized
                ? formatLastSeen(connection.last_seen_at, hardwareLive)
                : "Connect your Arduino to start live vital monitoring."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {authorized && (
            <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${hardwareLive ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
              <span className={`h-2 w-2 rounded-full ${hardwareLive ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`} />
              {hardwareLive ? "Live" : "Bridge waiting"}
            </span>
          )}

          {authorized && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDisconnect}
              disabled={actionLoading}
            >
              {actionLoading ? <LoaderCircle className="animate-spin" /> : <Unplug />}
              Disconnect
            </Button>
          )}

          <Button
            type="button"
            onClick={handleConnect}
            disabled={loading || actionLoading}
            className="bg-violet-600 text-white hover:bg-violet-700"
          >
            {actionLoading ? <LoaderCircle className="animate-spin" /> : <PlugZap />}
            {authorized ? "Reconnect Arduino" : "Connect Arduino"}
          </Button>
        </div>
      </div>

      {newDeviceToken && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">New device token created</p>
          <p className="mt-1 text-sm text-amber-800">
            Copy it into <code className="rounded bg-amber-100 px-1 py-0.5">ARDUINO_DEVICE_TOKEN</code> in
            <code className="ml-1 rounded bg-amber-100 px-1 py-0.5">backend/.env</code>, then restart the bridge.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs text-slate-700">
              {newDeviceToken}
            </code>
            <Button type="button" variant="outline" onClick={copyToken}>
              {copied ? <Check /> : <Copy />}
              {copied ? "Copied" : "Copy token"}
            </Button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
