# ==========================================================
# Gemini Service
# ==========================================================

import os
import json

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ==========================================================
# Load Environment Variables
# ==========================================================

load_dotenv()


class GeminiService:

    # ======================================================
    # Initialization
    # ======================================================

    def __init__(self):

        # --------------------------------------------------
        # API Key
        # --------------------------------------------------

        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured."
            )

        # --------------------------------------------------
        # Gemini Client
        # --------------------------------------------------

        self.client = genai.Client(
            api_key=api_key
        )

        # --------------------------------------------------
        # Models
        # --------------------------------------------------

        self.primary_model = "gemini-3-flash-preview"

        self.fallback_model = "gemini-2.5-flash"

        print("[OK] Gemini Service Loaded")
        print(
            f"Primary Model: {self.primary_model}"
        )
        print(
            f"Fallback Model: {self.fallback_model}"
        )

    # ======================================================
    # Generate With Model
    # ======================================================

    def _generate_with_model(
        self,
        model,
        prompt,
    ):

        response = (
            self.client.models.generate_content(

                model=model,

                contents=prompt,

                config=types.GenerateContentConfig(

                    temperature=0.2,

                    response_mime_type=(
                        "application/json"
                    ),

                ),

            )
        )

        text = response.text

        # --------------------------------------------------
        # Convert JSON Response
        # --------------------------------------------------

        try:

            return json.loads(text)

        except json.JSONDecodeError:

            return {
                "summary": text,
                "key_factors": [],
                "caregiver_guidance": [],
                "disclaimer": (
                    "This explanation is provided "
                    "for health monitoring and "
                    "educational purposes only."
                ),
            }

    # ======================================================
    # Generate
    # ======================================================

    def generate(
        self,
        prompt,
    ):

        # ==================================================
        # Try Primary Model
        # ==================================================

        try:

            print(
                f"🤖 Trying Gemini model: "
                f"{self.primary_model}"
            )

            return self._generate_with_model(
                self.primary_model,
                prompt,
            )

        except Exception as primary_error:

            print(
                "⚠️ Primary Gemini model failed."
            )

            print(
                f"Reason: {primary_error}"
            )

        # ==================================================
        # Try Fallback Model
        # ==================================================

        try:

            print(
                f"🔄 Trying fallback Gemini model: "
                f"{self.fallback_model}"
            )

            return self._generate_with_model(
                self.fallback_model,
                prompt,
            )

        except Exception as fallback_error:

            print(
                "❌ Fallback Gemini model also failed."
            )

            print(
                f"Reason: {fallback_error}"
            )

        # ==================================================
        # Safe Failure
        # ==================================================

        return {

            "summary": (
                "The AI explanation service is "
                "temporarily unavailable. "
                "The underlying health prediction "
                "was generated separately."
            ),

            "key_factors": [],

            "caregiver_guidance": [
                "Please try generating the explanation again later."
            ],

            "disclaimer": (
                "This explanation is provided for "
                "health monitoring and educational "
                "purposes only. It does not constitute "
                "a medical diagnosis or replace "
                "professional medical advice."
            ),

        }


# ==========================================================
# Singleton
# ==========================================================

gemini_service = GeminiService()
