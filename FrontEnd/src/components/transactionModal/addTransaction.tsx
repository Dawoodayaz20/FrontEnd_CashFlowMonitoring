import React, { useState, useEffect } from "react";
import useFormatters from "../../useFormatters";

// ─── Types ───────────────────────────────────────────────────────────────────

type TransactionType = "income" | "expense";
type Frequency = "weekly" | "monthly" | "yearly";

interface TransactionForm {
  type: TransactionType;
  amount: string;
  category: string;
  date: string;
  note: string;
  isRecurring: boolean;
  frequency: Frequency;
  endDate: string;
}

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionForm) => void;
  initialData?: Partial<TransactionForm>;
  transactType: TransactionType
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = {
  income: ["Salary", "Freelance", "Business", "Investment", "Rental", "Other"],
  expense: ["Rent", "Food", "Transport", "Utilities", "Healthcare", "Entertainment", "Subscriptions", "Other"],
};

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const today = new Date().toISOString().split("T")[0];

// ─── Component ────────────────────────────────────────────────────────────────

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSubmit, initialData, transactType }) => {
const { currencySymbol } = useFormatters();

useEffect(() => {
  setForm((prev) => ({ ...prev, type: transactType, category: "" }));
}, [transactType]);

  const [form, setForm] = useState<TransactionForm>({
    type: transactType,
    amount: "",
    category: "",
    date: today,
    note: "",
    isRecurring: false,
    frequency: "monthly",
    endDate: "",
    ...initialData,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TransactionForm, string>>>({});

  if (!isOpen) return null;

  const handleTypeSwitch = (type: TransactionType) => {
    setForm((prev) => ({ ...prev, type, category: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof TransactionForm, string>> = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      newErrors.amount = "Enter a valid amount";
    if (!form.category) newErrors.category = "Please select a category";
    if (!form.date) newErrors.date = "Please select a date";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    onClose();
  };

  const isIncome = form.type === "income";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex flex-col bg-white shadow-2xl animate-slide-in">

        {/* Header */}
        <div
          className="px-6 py-5 flex items-center justify-between"
          style={{
            background: isIncome
              ? "linear-gradient(135deg, #0f766e, #14b8a6)"
              : "linear-gradient(135deg, #be123c, #f43f5e)",
          }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">New Entry</p>
            <h2 className="text-xl font-bold text-white mt-0.5">Add Transaction</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
              {(["income", "expense"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeSwitch(t)}
                  className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                    form.type === t
                      ? t === "income"
                        ? "bg-teal-600 text-white shadow"
                        : "bg-rose-600 text-white shadow"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t === "income" ? "💰 Income" : "💸 Expense"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">{currencySymbol}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                className={`w-full pl-8 pr-4 py-3 border rounded-xl text-gray-800 font-semibold text-lg focus:outline-none focus:ring-2 transition ${
                  errors.amount
                    ? "border-rose-400 focus:ring-rose-200"
                    : "border-gray-200 focus:ring-teal-200"
                }`}
              />
            </div>
            {errors.amount && <p className="mt-1 text-xs text-rose-500">{errors.amount}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES[form.type].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, category: cat }))}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                    form.category === cat
                      ? isIncome
                        ? "bg-teal-600 text-white border-teal-600"
                        : "bg-rose-600 text-white border-rose-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {errors.category && <p className="mt-1 text-xs text-rose-500">{errors.category}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Date
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className={`w-full px-4 py-3 border rounded-xl text-gray-800 focus:outline-none focus:ring-2 transition ${
                errors.date
                  ? "border-rose-400 focus:ring-rose-200"
                  : "border-gray-200 focus:ring-teal-200"
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-rose-500">{errors.date}</p>}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Note <span className="normal-case font-normal text-gray-300">(optional)</span>
            </label>
            <textarea
              placeholder="Add a short description..."
              value={form.note}
              rows={2}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
            />
          </div>

          {/* Recurring Toggle */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-700">Recurring Transaction</p>
                <p className="text-xs text-gray-400 mt-0.5">Repeats automatically on a schedule</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, isRecurring: !p.isRecurring }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  form.isRecurring
                    ? isIncome
                      ? "bg-teal-600"
                      : "bg-rose-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    form.isRecurring ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {form.isRecurring && (
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    Frequency
                  </label>
                  <select
                    value={form.frequency}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, frequency: e.target.value as Frequency }))
                    }
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  >
                    {FREQUENCIES.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    End Date <span className="normal-case font-normal text-gray-300">(opt)</span>
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    min={today}
                    onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`flex-[2] py-3 rounded-xl text-white font-semibold shadow transition-all duration-200 hover:opacity-90 active:scale-95 ${
              isIncome ? "bg-teal-600" : "bg-rose-600"
            }`}
          >
            { initialData ? "Update Transaction" : "Save Transaction"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in {
          animation: slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </>
  );
};

export default AddTransactionModal;