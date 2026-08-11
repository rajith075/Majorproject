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

        api_key = os.getenv(
            "GEMINI_API_KEY"
        )

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
        # Model
        # --------------------------------------------------

        self.model = "gemini-3-flash-preview"

        print(
            "✅ Gemini Service Loaded"
        )

    # ======================================================
    # Generate
    # ======================================================

    def generate(
        self,
        prompt,
    ):

        response = (
            self.client.models.generate_content(

                model=self.model,

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

            return json.loads(
                text
            )

        except json.JSONDecodeError:

            return {
                "summary": text
            }


# ==========================================================
# Singleton
# ==========================================================

gemini_service = GeminiService()