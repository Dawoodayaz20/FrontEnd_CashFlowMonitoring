import { create } from 'zustand';
import type { Transaction, TransactionForm, TxType } from '../../types';

const API_URL = `${import.meta.env.VITE_API_URL}/transactions`;

// ─── Helper: shape form data → API payload ────────────────────────────────────
const toPayload = (form: TransactionForm) => ({
  type: form.type,
  amount: parseFloat(form.amount),
  category: form.category,
  note: form.note,
  date: form.date,
  recurring: {
    isRecurring: form.isRecurring,
    frequency: form.isRecurring ? form.frequency : null,
    endDate: form.isRecurring && form.endDate ? form.endDate : null,
  },
});

// ─── Store Interface ──────────────────────────────────────────────────────────
interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;

  fetchTransactions: (type?: TxType) => Promise<void>;
  addTransaction: (form: TransactionForm) => Promise<void>;
  updateTransaction: (id: string, form: TransactionForm) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
}

// ─── Store ────────────────────────────────────────────────────────────────────
const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  loading: false,
  error: null,

  // ── Fetch ──────────────────────────────────────────────────────────────────
  fetchTransactions: async (type?: TxType) => {
    set({ loading: true, error: null });
    try {
      const url = type ? `${API_URL}?type=${type}` : API_URL;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      set({ transactions: data.transactions });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // ── Add ────────────────────────────────────────────────────────────────────
  addTransaction: async (form: TransactionForm) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Refetch to sync with DB
      await get().fetchTransactions(form.type);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Update ─────────────────────────────────────────────────────────────────
  updateTransaction: async (id: string, form: TransactionForm) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(toPayload(form)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Refetch to sync with DB
      await get().fetchTransactions(form.type);
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Remove from local state directly (no need to refetch for delete)
      set((state) => ({
        transactions: state.transactions.filter((tx) => tx._id !== id),
        loading: false,
      }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },
}));

export const clearAllTransactions = async (password: string) => {
  try {
    const response = await fetch('http://localhost:5000/api/transactions/clear-all', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password })
    });

    const data = await response.json();

    if (response.ok) {
      return { 
        success: true, 
        message: data.message,
        deletedCount: data.deletedCount 
      };
    } else {
      return { success: false, message: data.message };
    }

  } catch (error) {
    console.error('Clear transactions error:', error);
    return { success: false, message: 'Network error' };
  }
};


export default useTransactionStore;