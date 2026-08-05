export const env = {
  APP_NAME: "Elderly Care AI",

  API_BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    "http://localhost:8000/api",

  APP_VERSION: "1.0.0",

  GEMINI_ENABLED:
    process.env.NEXT_PUBLIC_GEMINI_ENABLED === "true",
};