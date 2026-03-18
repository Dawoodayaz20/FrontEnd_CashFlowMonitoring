import React, { useState, useEffect } from "react";
import useSettingsStore from "../../store/useSettingsStore";
import type { Currency, DateFormat, BudgetLimits } from "../../store/useSettingsStore";
import useTransactionStore, { clearAllTransactions } from "../../store/useTransactionStore";
import VerifyAccountModal from '../ProfilePage/verifyAccountModal'
import useFormatters from "../../useFormatters";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GeneralSettings {
  currency: Currency;
  dateFormat: DateFormat;
  defaultPage: string;
}

interface NotificationSettings {
  lowBalanceAlert: boolean;
  lowBalanceThreshold: number;
  monthlySummary: boolean;
  recurringReminders: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CURRENCIES = [
  { value: "USD", label: "$ — US Dollar"       },
  { value: "EUR", label: "€ — Euro"            },
  { value: "GBP", label: "£ — British Pound"   },
  { value: "PKR", label: "₨ — Pakistani Rupee" },
  { value: "AED", label: "د.إ — UAE Dirham"    },
];

const DATE_FORMATS = [
  { value: "MM/DD/YYYY", label: "MM/DD/YYYY — US"         },
  { value: "DD/MM/YYYY", label: "DD/MM/YYYY — Europe"     },
  { value: "YYYY-MM-DD", label: "YYYY-MM-DD — ISO"        },
];

const DEFAULT_PAGES = [
  { value: "/dashboard", label: "Dashboard"   },
  { value: "/income",    label: "Income"      },
  { value: "/expense",   label: "Expense"     },
  { value: "/forecast",  label: "Forecast"    },
];

const EXPENSE_CATEGORIES = [
  "Rent", "Food", "Transport", "Utilities",
  "Healthcare", "Entertainment", "Subscriptions", "Other",
];

const CATEGORY_ICONS: Record<string, string> = {
  Rent:          "🏠",
  Food:          "🍔",
  Transport:     "🚗",
  Utilities:     "💡",
  Healthcare:    "🏥",
  Entertainment: "🎬",
  Subscriptions: "📦",
  Other:         "📝",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Section wrapper
const Section: React.FC<{
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
  danger?: boolean;
}> = ({ title, subtitle, icon, children, danger }) => (
  <div className={`bg-white border rounded-2xl shadow-sm overflow-hidden ${
    danger ? "border-rose-100" : "border-gray-100"
  }`}>
    <div className={`px-6 py-4 border-b flex items-center gap-3 ${
      danger ? "border-rose-100 bg-rose-50/50" : "border-gray-100 bg-gray-50/50"
    }`}>
      <span className="text-xl">{icon}</span>
      <div>
        <h2 className={`text-sm font-bold ${danger ? "text-rose-700" : "text-gray-700"}`}>
          {title}
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
    <div className="px-6 py-5">{children}</div>
  </div>
);

// Toggle switch
const Toggle: React.FC<{
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div>
      <p className="text-sm font-semibold text-gray-700">{label}</p>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
        checked ? "bg-teal-600" : "bg-gray-200"
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
        checked ? "translate-x-5" : "translate-x-0"
      }`} />
    </button>
  </div>
);

// Select field
const SelectField: React.FC<{
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const SettingsPage: React.FC = () => {

  const { settings, saveSettings, fetchSettings } = useSettingsStore();
  const { transactions, fetchTransactions} = useTransactionStore();
  const { currencySymbol } = useFormatters();

  useEffect(() => {
    fetchSettings();
    fetchTransactions();
  }, []);

  useEffect(() => {
  setGeneral({
    currency:    settings.currency,
    dateFormat:  settings.dateFormat,
    defaultPage: settings.defaultPage,
  });
  setBudgets(settings.budgetLimits);
  setNotifications(settings.notifications);
  }, [settings]);

  // ── State ──
  const [general, setGeneral] = useState<GeneralSettings>({
    currency:    `${settings ? settings.currency : "USD"}`,
    dateFormat:  settings.dateFormat,
    defaultPage: "/dashboard",
  });

  const [budgets, setBudgets] = useState<BudgetLimits>({
    Rent:          900,
    Food:          300,
    Transport:     150,
    Utilities:     100,
    Healthcare:    100,
    Entertainment: 80,
    Subscriptions: 50,
    Other:         100,
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    lowBalanceAlert:     true,
    lowBalanceThreshold: 500,
    monthlySummary:      true,
    recurringReminders:  false,
  });

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ modalOpen, setModalOpen ] = useState<boolean>(false);

  // ── Handlers ──
  const handleSave = () => {
    saveSettings({
  currency:      general.currency,
  dateFormat:    general.dateFormat,
  defaultPage:   general.defaultPage,
  budgetLimits:  budgets,
  notifications: notifications });
    // → wire to backend / localStorage later
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Note", "Recurring"];
    
    const rows = transactions.map(tx => [
      tx.date,
      tx.type,
      tx.category,
      tx.amount,
      tx.note ?? "",
      tx.recurring.isRecurring ? tx.recurring.frequency : "No",
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalBudget = Object.values(budgets).reduce((s, v) => s + v, 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page Body ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6 max-w-4xl">

        {/* ── General ─────────────────────────────────────────────────────── */}
        <Section
          icon="⚙️"
          title="General"
          subtitle="Configure your regional and display preferences"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <SelectField
              label="Currency"
              value={general.currency}
              options={CURRENCIES}
              onChange={(v) => setGeneral(p => ({ ...p, currency: v as Currency }))}
            />
            <SelectField
              label="Date Format"
              value={general.dateFormat}
              options={DATE_FORMATS}
              onChange={(v) => setGeneral(p => ({ ...p, dateFormat: v as DateFormat }))}
            />
            <SelectField
              label="Default Landing Page"
              value={general.defaultPage}
              options={DEFAULT_PAGES}
              onChange={(v) => setGeneral(p => ({ ...p, defaultPage: v }))}
            />
          </div>
        </Section>

        {/* ── Budget Limits ────────────────────────────────────────────────── */}
        <Section
          icon="🎯"
          title="Monthly Budget Limits"
          subtitle="Set spending caps per category — the dashboard will flag overruns"
        >
          {/* Total budget bar */}
          <div className="flex items-center justify-between mb-5 px-4 py-3 bg-teal-50 border border-teal-100 rounded-xl">
            <p className="text-sm font-semibold text-teal-700">Total Monthly Budget</p>
            <p className="text-lg font-bold text-teal-700">
              {currencySymbol}{totalBudget.toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPENSE_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                {/* Icon + label */}
                <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-base shrink-0">
                  {CATEGORY_ICONS[cat]}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    {cat}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={budgets[cat]}
                      onChange={(e) =>
                        setBudgets(p => ({ ...p, [cat]: Number(e.target.value) }))
                      }
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </Section>

        {/* ── Notifications ────────────────────────────────────────────────── */}
        <Section
          icon="🔔"
          title="Notifications"
          subtitle="Control when and how the app alerts you"
        >
          <div className="space-y-1">
            <Toggle
              checked={notifications.monthlySummary}
              onChange={(v) => setNotifications(p => ({ ...p, monthlySummary: v }))}
              label="Monthly Summary Report"
              description="Get a summary of your cash flow at the end of each month"
            />
            <Toggle
              checked={notifications.recurringReminders}
              onChange={(v) => setNotifications(p => ({ ...p, recurringReminders: v }))}
              label="Recurring Transaction Reminders"
              description="Get reminded before a recurring transaction is due"
            />
            <Toggle
              checked={notifications.lowBalanceAlert}
              onChange={(v) => setNotifications(p => ({ ...p, lowBalanceAlert: v }))}
              label="Low Balance Alert"
              description="Get notified when your balance drops below a threshold"
            />

            {/* Threshold input — only visible when alert is on */}
            {notifications.lowBalanceAlert && (
              <div className="pt-3 pb-1 pl-4 ml-2 border-l-2 border-teal-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Alert Threshold
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">{currencySymbol}</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={notifications.lowBalanceThreshold}
                    onChange={(e) =>
                      setNotifications(p => ({ ...p, lowBalanceThreshold: Number(e.target.value) }))
                    }
                    className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1.5">
                  You'll be alerted when balance falls below this amount
                </p>
              </div>
            )}
            <div className="items-start justify-start">
          {/* Save button */}
          <button
            onClick={handleSave}
            className={`mt-10 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95 bg-emerald-500 text-white mt-10${
              saved
                ? "bg-emerald-500 text-white hover:bg-emerald-300 shadow"
                : "bg-white text-slate-700 hover:bg-emerald-300 shadow"
            }`}
          >
            {saved ? "✓ Saved!" : "Save Changes"}
          </button>
          </div>
          </div>
        </Section>

        {/* ── Data Management ──────────────────────────────────────────────── */}
        <Section
          icon="🗄️"
          title="Data Management"
          subtitle="Export your data or reset your account"
          danger
        >
          <div className="space-y-4">

            {/* Export */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div>
                <p className="text-sm font-semibold text-gray-700">Export Transactions</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Download all your transactions as a CSV file
                </p>
              </div>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition active:scale-95"
              >
                ⬇️ Export CSV
              </button>
            </div>

            {/* Clear data — danger zone */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-rose-100 bg-rose-50/50">
              <div>
                <p className="text-sm font-semibold text-rose-700">Clear All Data</p>
                <p className="text-xs text-rose-400 mt-0.5">
                  Permanently delete all transactions. This cannot be undone.
                </p>
              </div>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition active:scale-95"
                >
                  Clear Data
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-rose-600 font-semibold mr-1">Are you sure?</p>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-3 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setModalOpen(true);
                      setShowClearConfirm(false)
                    }}
                    className="px-3 py-2 rounded-xl text-sm font-semibold bg-rose-600 text-white hover:bg-rose-700 transition active:scale-95"
                  >
                    Yes, delete
                  </button>
                </div>
              )}
            </div>

          </div>
        </Section>

              <VerifyAccountModal
                        isOpen={modalOpen}
                        title="Delete Transactions"
                        onClose={() => setModalOpen(false)}
                        onConfirm={ async (password) => {
                          try {
                            const result = await clearAllTransactions(password);
                            if (result) setModalOpen(false);
                          } catch (err) {
                            console.log(err);
                          }
                        }}
                      />

      </div>{/* end page body */}
    </div>
  );
};

export default SettingsPage;