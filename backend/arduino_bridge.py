import time
from os import getenv
from pathlib import Path

import requests
import serial
from dotenv import load_dotenv


load_dotenv(Path(__file__).with_name(".env"))

# ==============================
# CONFIGURATION
# ==============================

SERIAL_PORT = getenv("ARDUINO_SERIAL_PORT", "COM5")
BAUD_RATE = int(getenv("ARDUINO_BAUD_RATE", "9600"))

# Backend address and device credential. Keep the credential in .env, never in
# source control. Generate a fresh value with POST /devices/connect.
API_URL = getenv("ARDUINO_API_URL", "http://127.0.0.1:8000").rstrip("/")
DEVICE_TOKEN = getenv("ARDUINO_DEVICE_TOKEN")
REQUEST_TIMEOUT_SECONDS = float(getenv("ARDUINO_REQUEST_TIMEOUT_SECONDS", "30"))

if not DEVICE_TOKEN:
    raise SystemExit(
        "ARDUINO_DEVICE_TOKEN is not configured. Add the token returned by "
        "POST /devices/connect to backend/.env, then restart this bridge."
    )


# ==============================
# SERIAL CONNECTION
# ==============================

print("====================================")
print("     ELDERCARE ARDUINO BRIDGE")
print("====================================")
print(f"Serial Port : {SERIAL_PORT}")
print(f"Baud Rate   : {BAUD_RATE}")
print("Device token: configured")
print("------------------------------------")

try:
    arduino = serial.Serial(
        SERIAL_PORT,
        BAUD_RATE,
        timeout=1
    )

    time.sleep(2)

    print("Arduino connected successfully.")
    print("Waiting for sensor data...")
    print("------------------------------------")

except Exception as e:

    print("ERROR: Could not connect to Arduino.")
    print(e)
    raise SystemExit


# ==============================
# READ SERIAL DATA
# ==============================

fall_active = False

while True:

    try:

        line = arduino.readline().decode(
            "utf-8",
            errors="ignore"
        ).strip()

        if not line:
            continue

        print(f"[ARDUINO] {line}")


        # ==========================================
        # ONLY PROCESS MACHINE-READABLE DATA
        # ==========================================

        if not line.startswith("DATA,"):
            continue


        # Expected:
        # DATA,140,97,36.9,0

        parts = line.split(",")

        if len(parts) != 5:
            print("[BRIDGE] Invalid DATA format:", line)
            continue


        # ==========================================
        # PARSE VALUES
        # ==========================================

        heart_rate = int(parts[1])
        spo2 = int(parts[2])
        temperature = float(parts[3])
        fall_detected = int(parts[4])


        print()
        print("========== SENSOR DATA ==========")
        print(f"Heart Rate : {heart_rate} BPM")
        print(f"SpO2       : {spo2}%")
        print(f"Temperature: {temperature} C")
        print(f"Fall       : {fall_detected}")
        print("=================================")


        # ==========================================
        # BUILD VITAL PAYLOAD
        # ==========================================

        payload = {
            "heart_rate": heart_rate,
            "spo2": spo2,
            "temperature": temperature,
        }

        # This Arduino data format only measures heart rate, SpO2 and
        # temperature. Do not send made-up BP, respiration, sleep or step
        # values: the dashboard will clearly show those as unavailable until
        # their respective sensors are integrated.


        # ==========================================
        # SEND VITAL TO EXISTING BACKEND
        # ==========================================

        try:

            response = requests.post(
                f"{API_URL}/devices/vitals",
                json=payload,
                headers={"X-Device-Token": DEVICE_TOKEN},
                # Saving succeeds before the optional AI work runs, but the
                # response can still take longer than a normal HTTP request.
                timeout=REQUEST_TIMEOUT_SECONDS,
            )

            print(
                f"[BACKEND] Vital response: "
                f"{response.status_code}"
            )

            if response.status_code >= 400:

                print(
                    "[BACKEND] Error:",
                    response.text
                )

        except requests.RequestException as e:

            print("[BACKEND] Connection error:", e)


        # ==========================================
        # FALL DETECTED
        # ==========================================

        if fall_detected == 0:
            fall_active = False

        elif fall_detected == 1 and not fall_active:
            # Report one emergency for the start of a fall. The sensor must
            # return to 0 before a later, distinct fall can be reported.
            fall_active = True

            print()
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            print("          FALL DETECTED")
            print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
            print("Sending emergency push notification and call request.")
            print()

            try:
                fall_response = requests.post(
                    f"{API_URL}/devices/fall",
                    headers={"X-Device-Token": DEVICE_TOKEN},
                    timeout=REQUEST_TIMEOUT_SECONDS,
                )
                print(f"[BACKEND] Fall alert response: {fall_response.status_code}")
                if fall_response.status_code >= 400:
                    print("[BACKEND] Fall alert error:", fall_response.text)
            except requests.RequestException as error:
                print("[BACKEND] Fall alert connection error:", error)


    except KeyboardInterrupt:

        print()
        print("Stopping Arduino bridge...")
        break


    except Exception as e:

        print("[BRIDGE ERROR]", e)


# ==============================
# CLEANUP
# ==============================

arduino.close()

print("Arduino connection closed.")
