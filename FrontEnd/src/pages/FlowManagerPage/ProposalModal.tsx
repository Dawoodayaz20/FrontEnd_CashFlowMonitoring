import React, { useState, useEffect } from "react";
import type { TransactionForm } from "../../../types";

// export interface TransactionProposal {
//   amount: number;
//   type: "income" | "expense";
//   category: string;
//   note: string;
//   date?: string;
// }

interface ProposalModalProps {
  isOpen: boolean;
  proposal: TransactionForm | null;
  onConfirm: (updatedProposal: TransactionForm) => void;
  onClose: () => void;
}

const ProposalModal: React.FC<ProposalModalProps> = ({
  isOpen,
  proposal,
  onConfirm,
  onClose,
}) => {
  const [formData, setFormData] = useState<TransactionForm>({
    type: "expense",
    amount: 0,
    category: "",
    date: new Date().toISOString().split("T")[0],
    note: "",
    isRecurring: false,
    frequency: null,
    endDate: null,
  });

  useEffect(() => {
    if (proposal) {
      setFormData({
        amount: proposal.amount || 0,
        type: proposal.type || "expense",
        category: proposal.category || "General",
        note: proposal.note || "",
        date: proposal.date || new Date().toISOString().split("T")[0],
        isRecurring: proposal.isRecurring || false,
        frequency: proposal.frequency || null,
        endDate: proposal.date || null,
      });
    }
  }, [proposal]);

  if (!isOpen || !proposal) return null;

  const handleChange = (field: keyof TransactionForm, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 text-white flex items-center justify-between"
          style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">💡</span>
            <div>
              <h3 className="text-base font-bold leading-tight">
                New Transaction Proposal
              </h3>
              <p className="text-xs text-teal-100">
                Review and edit details before saving
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-lg font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleChange("type", "income")}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  formData.type === "income"
                    ? "bg-teal-50 border-teal-300 text-teal-700 font-bold"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                💰 Income
              </button>
              <button
                type="button"
                onClick={() => handleChange("type", "expense")}
                className={`py-2 rounded-xl text-xs font-semibold border transition ${
                  formData.type === "expense"
                    ? "bg-rose-50 border-rose-300 text-rose-600 font-bold"
                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                💸 Expense
              </button>
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Description / Note
            </label>
            <input
              type="text"
              value={formData.note}
              onChange={(e) => handleChange("note", e.target.value)}
              placeholder="e.g., Grocery shopping"
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-semibold">
                  $
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    handleChange("amount", parseFloat(e.target.value) || 0)
                  }
                  required
                  className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                placeholder="e.g., Food"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white shadow transition active:scale-95 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              }}
            >
              ✓ Confirm & Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProposalModal;