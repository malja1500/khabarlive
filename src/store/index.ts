"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Theme } from "@/types";
import { Locale } from "@/lib/i18n";

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  login: (user: User) => void;
  logout: () => void;
}

interface AppStore {
  theme: Theme;
  locale: Locale;
  setTheme: (t: Theme) => void;
  setLocale: (l: Locale) => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,
      login: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
    }),
    { name: "khabarlive-auth" }
  )
);

export const useApp = create<AppStore>()(
  persist(
    (set) => ({
      theme: "dark",
      locale: "fa",
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: "khabarlive-app" }
  )
);
