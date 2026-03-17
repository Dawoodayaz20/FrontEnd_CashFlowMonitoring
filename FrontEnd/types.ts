export interface FinancialData {
  monthlyIncome: number;
  fixedExpenses: number;
  variableExpenses: number;
  currentSavings: number;
  forecastPeriod: 3 | 6 | 12;
}

export interface MonthlyForecast {
  month: string;
  balance: number;
  income: number;
  expenses: number;
}

export interface RiskLevel {
  status: 'safe' | 'tight' | 'high-risk';
  label: string;
  icon: string;
}

// ─── Transaction Types ────────────────────────────────────────────────────────

export type TxType = "income" | "expense";
export type Frequency = "weekly" | "monthly" | "yearly";

export interface Transaction {
  _id: string;
  userId: string;
  type: TxType;
  amount: number;
  category: string;
  note?: string;
  date: string;
  recurring: {
    isRecurring: boolean;
    frequency: Frequency | null;
    endDate?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TransactionForm {
  type: TxType;
  amount: string;
  category: string;
  date: string;
  note: string;
  isRecurring: boolean;
  frequency: Frequency;
  endDate: string;
}