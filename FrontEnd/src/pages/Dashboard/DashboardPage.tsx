import React, { useEffect, useState, useMemo } from "react";
import AreaChartComp from "../../components/areaChartComp/AreaChart";
import AddTransactionModal from "../../components/transactionModal/addTransaction";
import useTransactionStore from "../../store/useTransactionStore";
import type { Transaction } from "../../../types";
import useSettingsStore from "../../store/useSettingsStore";
import useFormatters from "../../useFormatters";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TransactionForm {
  type: "income" | "expense";
  amount: string;
  category: string;
  date: string;
  note: string;
  isRecurring: boolean;
  frequency: "weekly" | "monthly" | "yearly";
  endDate: string;
}

interface transactionDataInt {
  month: string,
  income: number,
  expense: number
}

// ─── Budget Status Helper ─────────────────────────────────────────────────────

type BudgetStatus = "over" | "near" | "safe";

const buildBudgetStatus = (
  transactions: Transaction[],
  budgetLimits: Record<string, number>
): Record<string, BudgetStatus> => {
  // Use the most recent transaction's month instead of today's month
  const latestDate = transactions.reduce((latest, tx) => {
    const d = new Date(tx.date);
    return d > latest ? d : latest;
  }, new Date(0));

  const thisMonth = latestDate.getMonth();
  const thisYear  = latestDate.getFullYear();

  // Sum expenses per category for current month only
  const spent: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type !== "expense") return;
    const d = new Date(tx.date);
    if (d.getMonth() !== thisMonth || d.getFullYear() !== thisYear) return;
    spent[tx.category] = (spent[tx.category] ?? 0) + tx.amount;
  });

  // Build status map
  const status: Record<string, BudgetStatus> = {};
  Object.entries(budgetLimits).forEach(([cat, limit]) => {
    if (!limit) return;
    const ratio = (spent[cat] ?? 0) / limit;
    if      (ratio >= 1.0) status[cat] = "over";
    else if (ratio >= 0.8) status[cat] = "near";
    else                   status[cat] = "safe";
  });

  return status;
};

// ─── Budget Badge ─────────────────────────────────────────────────────────────

const BudgetBadge: React.FC<{ status: BudgetStatus }> = ({ status }) => {
  if (status === "safe") return null;
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
      status === "over"
        ? "bg-rose-100 text-rose-600"
        : "bg-amber-100 text-amber-600"
    }`}>
      {status === "over" ? "⚠ Over budget" : "● Near limit"}
    </span>
  );
};

// ─── Summary Card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  accent?: "teal" | "rose" | "neutral" | "positive";
  icon: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, accent = "neutral", icon }) => {
  const accentStyles = {
    teal:     "from-teal-50 to-teal-100/60 border-teal-200",
    rose:     "from-rose-50 to-rose-100/60 border-rose-200",
    positive: "from-emerald-50 to-emerald-100/60 border-emerald-200",
    neutral:  "from-white to-gray-50 border-gray-200",
  };
  const valueStyles = {
    teal:     "text-teal-700",
    rose:     "text-rose-600",
    positive: "text-emerald-600",
    neutral:  "text-gray-800",
  };

  return (
    <div className={`bg-gradient-to-br ${accentStyles[accent]} border rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <span className="text-lg">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${valueStyles[accent]}`}>{value}</p>
    </div>
  );
};

// ─── Dashboard Component ──────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  // const navigate = useNavigate();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { settings } = useSettingsStore();
  const { formatCurrency, formatDate } = useFormatters();

  const budgetStatus = useMemo(
    () => buildBudgetStatus(transactions, settings.budgetLimits),
    [transactions, settings.budgetLimits]
  );

  useEffect(()=>{
    fetchTransactions();
  }, [])

  const handleTransactionSubmit = () => {
    // console.log("New transaction:", data);
    // → wire to useTransactionStore later
  };

  const chartData = (data: Transaction[]): transactionDataInt[] => {
  // Step 1: Build the last 6 months as fixed buckets
  const months: transactionDataInt[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({
      month: d.toLocaleString("default", { month: "short" }),
      income: 0,
      expense: 0,
    });
  }

  // Step 2: Loop transactions and add amounts to the right bucket
  data.forEach((tx) => {
    const txMonth = new Date(tx.date).toLocaleString("default", { month: "short" });
    const bucket  = months.find((m) => m.month === txMonth);
    if (!bucket) return;

    if (tx.type === "income")  bucket.income  += tx.amount;
    if (tx.type === "expense") bucket.expense += tx.amount;
  });

  return months;
  };
  
  const recentTransactions = transactions
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .slice(0,5);

  const totalIncome : number = recentTransactions
  .filter((tx) => tx.type === 'income')
  .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense : number = recentTransactions
  .filter((tx) => tx.type ==='expense')
  .reduce((sum, tx) => sum + tx.amount, 0) 

  const totalBalance : number = totalIncome - totalExpense

  const AvgIncome = (amount: number) : number => Math.round(amount/12);
  const AvgExpense = (amount: number) : number => Math.round(amount/12);

  return (
    <div className="flex w-full h-screen bg-gray-50 font-sans">

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">

        {/* Page Body */}
        <div className="px-8 py-6 space-y-6">

          {/* ── Summary Cards ──────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard label="Total Balance"     value={formatCurrency(totalBalance)}   accent="neutral"  icon="🏦" />
            <SummaryCard label="Income"            value={formatCurrency(totalIncome)}    accent="teal"     icon="💰" />
            <SummaryCard label="Expenses"          value={formatCurrency(totalExpense)}   accent="rose"     icon="💸" />
            <SummaryCard label="Net Monthly"       value={formatCurrency(totalIncome)}    accent="positive" icon="📈" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">

            {/* LEFT: Risk Status + Transactions Overview */}
            <div className="flex flex-col gap-4">

              {/* Risk Status */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Risk Status</h2>
                  <p className="text-gray-600 text-sm">Based on income, expenses & savings rate</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700 font-semibold text-sm">Safe</span>
                </div>
              </div>

              {/* Transactions Overview */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Transactions Overview</h2>
                    <p className="text-gray-500 text-xs">Your most recent entries</p>
                  </div>
                  <button className="text-xs font-semibold text-teal-600 hover:text-teal-700 transition">
                    View all →
                  </button>
                </div>

                {/* Transaction List — static placeholder, wired to store later */}
                <div className="space-y-2">
                  {recentTransactions.map((tx) => (
                    <div
                      key={tx._id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                    >
                      {/* Left: icon + label + date */}
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                            tx.type === "income"
                              ? "bg-teal-50 text-teal-600"
                              : "bg-rose-50 text-rose-500"
                          }`}
                        >
                          {tx.type === "income" ? "💰" : "💸"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 leading-tight">
                            <p className="text-sm font-semibold text-gray-700">{tx.note}</p>
                            {tx.type === "expense" && budgetStatus[tx.category] && (
                              <BudgetBadge status={budgetStatus[tx.category]} />
                            )}
                          </div>
                          <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                        </div>
                      </div>

                      {/* Right: amount */}
                      <span
                        className={`text-sm font-bold ${
                          tx.type === "income" ? "text-teal-600" : "text-rose-500"
                        }`}
                      >
                        {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT: Cash Flow Forecast Chart */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">Cash-Flow Forecast</h2>
                  <p className="text-gray-600 text-sm">Monthly income vs expenses</p>
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-100">
                  Last 6 months
                </span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <AreaChartComp data={chartData(transactions)}/>
              </div>
            </div>

          </div>

          {/* ── Monthly Summary Cards ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Avg Income",       value: formatCurrency(AvgIncome(totalIncome)),   icon: "📊", accent: "teal"     as const },
              { label: "Avg Expenses",     value: formatCurrency(AvgExpense(totalExpense)),  icon: "🧾", accent: "rose"     as const },
              { label: "Monthly Net",      value: formatCurrency(AvgExpense(totalBalance)),  icon: "💹", accent: "positive" as const },
              { label: "Survival Months",  value: "8 months", icon: "🛡️", accent: "neutral"  as const },
            ].map((item) => (
              <SummaryCard key={item.label} label={item.label} value={item.value} icon={item.icon} accent={item.accent} />
            ))}
          </div>

          {/* ── What If Simulator ──────────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">What If Simulator</h2>
              <p className="text-gray-600 text-sm">Adjust variables to see how your cash flow would change</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { placeholder: "Rent increase ($)", label: "Rent Change" },
                { placeholder: "Income change ($)",  label: "Income Change" },
                { placeholder: "New expense ($)",    label: "New Expense" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                    {field.label}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full pl-7 pr-4 py-2.5 border border-gray-200 rounded-xl text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-teal-200 transition"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-48 flex items-center justify-center rounded-xl border border-dashed border-gray-200 text-gray-300 font-semibold text-sm">
              Updated forecast will appear here
            </div>
          </div>

        </div>{/* end page body */}
      </main>

      {/* ── Transaction Modal ─────────────────────────────────────────────────── */}
      <AddTransactionModal
        isOpen={modalOpen}
        transactType='income'
        onClose={() => setModalOpen(false)}
        onSubmit={handleTransactionSubmit}
      />
    </div>
  );
};

export default Dashboard;
