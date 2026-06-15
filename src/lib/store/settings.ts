"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface NotificationPrefs {
  criticalAlerts: boolean;
  sarFiled: boolean;
  weeklyDigest: boolean;
  kycPending: boolean;
}

interface SettingsState {
  notifications: NotificationPrefs;
  setNotification: (key: keyof NotificationPrefs, value: boolean) => void;
}

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  criticalAlerts: true,
  sarFiled: true,
  weeklyDigest: false,
  kycPending: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      notifications: DEFAULT_NOTIFICATIONS,
      setNotification: (key, value) =>
        set((state) => ({
          notifications: { ...state.notifications, [key]: value },
        })),
    }),
    {
      name: "smartcomply-settings",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
