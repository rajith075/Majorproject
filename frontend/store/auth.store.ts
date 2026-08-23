import { create } from "zustand";

export interface CurrentUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: "family" | "caregiver" | "doctor";
}

interface AuthStore {
  user: CurrentUser | null;
  setUser: (user: CurrentUser) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,

  setUser: (user) =>
    set({
      user,
    }),

  clearUser: () =>
    set({
      user: null,
    }),
}));