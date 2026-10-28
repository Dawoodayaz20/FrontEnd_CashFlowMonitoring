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

export interface SettingsState {
  settings: AppSettings;
  loading:  boolean;
  error:    string | null;

  fetchSettings: () => Promise<void>;
  saveSettings:  (updated: AppSettings) => Promise<void>;
}