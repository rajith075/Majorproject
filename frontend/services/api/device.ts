import API from "./axios";

export interface DeviceConnection {
  id: number;
  patient_id: number;
  patient_name: string | null;
  device_name: string;
  status: "connected" | "disconnected";
  connected_at: string;
  last_seen_at: string | null;
}

export interface DeviceConnectionStatus {
  connected: boolean;
  connection: DeviceConnection | null;
}

export interface DeviceConnectResponse {
  success: boolean;
  connection_id: number;
  patient_id: number;
  patient_name: string;
  device_name: string;
  device_token: string;
  status: "connected";
  connected_at: string;
}

export const getDeviceConnection = async (): Promise<DeviceConnectionStatus> => {
  const response = await API.get("/devices/connection", {
    params: { _: Date.now() },
    headers: { "Cache-Control": "no-cache" },
  });
  return response.data;
};

export const connectDevice = async (): Promise<DeviceConnectResponse> => {
  const response = await API.post("/devices/connect");
  return response.data;
};

export const disconnectDevice = async (): Promise<{ success: boolean }> => {
  const response = await API.post("/devices/disconnect");
  return response.data;
};
