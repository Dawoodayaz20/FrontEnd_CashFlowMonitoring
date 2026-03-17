import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Currency   = "USD" | "EUR" | "GBP" | "PKR" | "AED";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
export type BudgetLimits = {
  [category: string]: number;
}

export interface CurrencyBudgetLimits {
  Rent:          number;
  Food:          number;
  Transport:     number;
  Utilities:     number;
  Healthcare:    number;
  Entertainment: number;
  Subscriptions: number;
  Other:         number;
  [key: string]: number;
}

export interface NotificationSettings {
  lowBalanceAlert:     boolean;
  lowBalanceThreshold: number;
  monthlySummary:      boolean;
  recurringReminders:  boolean;
}

export interface AppSettings {
  currency:      Currency;
  dateFormat:    DateFormat;
  defaultPage:   string;
  budgetLimits:  BudgetLimits;
  notifications: NotificationSettings;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  currency:    "USD",
  dateFormat:  "MM/DD/YYYY",
  defaultPage: "/dashboard",
  budgetLimits: {
    Rent:          0,
    Food:          0,
    Transport:     0,
    Utilities:     0,
    Healthcare:    0,
    Entertainment: 0,
    Subscriptions: 0,
    Other:         0,
  },
  notifications: {
    lowBalanceAlert:     true,
    lowBalanceThreshold: 100,
    monthlySummary:      true,
    recurringReminders:  false,
  },
};

const API_URL = `${import.meta.env.VITE_API_URL}/settings`;

// ─── Store Interface ──────────────────────────────────────────────────────────

interface SettingsState {
  settings: AppSettings;
  loading:  boolean;
  error:    string | null;

  fetchSettings: () => Promise<void>;
  saveSettings:  (updated: AppSettings) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  loading:  false,
  error:    null,

  // ── Fetch ─────────────────────────────────────────────────────────────────
  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        credentials: 'include'  // send JWT cookie
      });

      if (!res.ok) throw new Error('Failed to fetch settings');

      const data = await res.json();
      set({ settings: { ...DEFAULT_SETTINGS, ...data.settings } });

    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // ── Save ──────────────────────────────────────────────────────────────────
  saveSettings: async (updated: AppSettings) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',  // send JWT cookie
        body: JSON.stringify(updated)
      });

      if (!res.ok) throw new Error('Failed to save settings');

      const data = await res.json();
      set({ settings: { ...DEFAULT_SETTINGS, ...data.settings } });

    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useSettingsStore;