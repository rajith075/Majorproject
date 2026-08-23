import { getCurrentUser } from "@/services/auth/me";
import { useAuthStore } from "@/store/auth.store";

export class AuthService {

  // ==========================================================
  // GET TOKEN
  // ==========================================================

  static getToken(): string | null {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }


  // ==========================================================
  // REMOVE TOKEN
  // ==========================================================

  static removeToken(): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("token");
  }


  // ==========================================================
  // LOAD CURRENT USER
  // ==========================================================

  static async loadCurrentUser() {
    try {

      console.log("🔵 AUTH: Loading current user...");

      const user = await getCurrentUser();

      console.log(
        "👤 AUTH: Current user:",
        user
      );

      useAuthStore
        .getState()
        .setUser(user);

      return user;

    } catch (error) {

      console.error(
        "❌ AUTH: Failed to load current user:",
        error
      );

      useAuthStore
        .getState()
        .clearUser();

      return null;
    }
  }


  // ==========================================================
  // CLEAR USER
  // ==========================================================

  static clearUser(): void {

    console.log(
      "🧹 AUTH: Clearing current user..."
    );

    useAuthStore
      .getState()
      .clearUser();
  }


  // ==========================================================
  // LOGOUT
  // ==========================================================

  static logout(): void {

    console.log(
      "🚪 AUTH: Logging out..."
    );

    // Remove JWT
    AuthService.removeToken();

    // Clear Zustand user
    AuthService.clearUser();
  }
}