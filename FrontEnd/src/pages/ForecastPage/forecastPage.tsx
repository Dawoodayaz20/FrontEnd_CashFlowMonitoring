import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area,
  ComposedChart,
} from "recharts";
import useTransactionStore from "../../store/useTransactionStore";

// ─── Types ────────────────────────────────────────────────────────────────────

type Horizon = 3 | 6 | 12;

interface WhatIf {
  incomeChange: number;
  expenseChange: number;
  extraSavings: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const getMonthLabel = (offset: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
};

const normalizeToMonthly = (amount: number, frequency: null | "weekly" | "monthly" | "yearly"): number => {
  if (frequency === "weekly")  return amount * 4.33;
  if (frequency === "yearly")  return amount / 12;
  return amount;
};

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

const ForecastTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const balance = payload[0]?.value ?? 0;
  const isNeg   = balance < 0;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      <p className={`text-lg font-bold ${isNeg ? "text-rose-600" : "text-teal-600"}`}>
        {isNeg ? "-" : ""}{fmt(balance)}
      </p>
      <p className={`text-xs mt-0.5 ${isNeg ? "text-rose-400" : "text-gray-400"}`}>
        {isNeg ? "⚠️ Deficit" : "Projected balance"}
      </p>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const ForecastPage: React.FC = () => {
  const [horizon,  setHorizon]  = useState<Horizon>(6);
  const [whatIf,   setWhatIf]   = useState<WhatIf>({
    incomeChange:  0,
    expenseChange: 0,
    extraSavings:  0,
  });

  const { transactions, fetchTransactions } = useTransactionStore();

  useEffect(() => {
    fetchTransactions()
  }, [])

  const totalIncome = transactions
  .filter((tx) => tx.type === 'income')
  .reduce((sum, tx) => sum = sum + tx.amount, 0);

  const totalExpenses = transactions
  .filter((tx) => tx.type ==='expense')
  .reduce((sum, tx) => sum + tx.amount, 0);

  const distinctMonths = new Set(
    transactions.map(tx => tx.date.slice(0, 7)) // "2024-01"
  ).size;

  
  const CURRENT_BALANCE = totalIncome - totalExpenses;
  
  const AVG_MONTHLY_INCOME  = totalIncome / (distinctMonths || 1);
  const AVG_MONTHLY_EXPENSE = totalExpenses / (distinctMonths || 1);

  // ── Compute monthly net with what-if adjustments ──
  const adjustedIncome  = AVG_MONTHLY_INCOME  + whatIf.incomeChange;
  const adjustedExpense = AVG_MONTHLY_EXPENSE + whatIf.expenseChange + whatIf.extraSavings;
  const monthlyNet      = adjustedIncome - adjustedExpense;

  // ── Build projection data ──
  const projectionData = useMemo(() => {
    const points = [];
    let balance = CURRENT_BALANCE;
    // Include current month as starting point
    points.push({ month: "Now", balance: Math.round(balance), projected: false });
    for (let i = 1; i <= horizon; i++) {
      balance += monthlyNet;
      points.push({
        month:     getMonthLabel(i),
        balance:   Math.round(balance),
        projected: true,
      });
    }
    return points;
  }, [horizon, monthlyNet, CURRENT_BALANCE]);

  // ── Runway calculation ──
  const runway = useMemo(() => {
    if (monthlyNet >= 0) return null; // Growing — no depletion
    return Math.floor(CURRENT_BALANCE / Math.abs(monthlyNet));
  }, [monthlyNet, CURRENT_BALANCE]);

  // ── Final projected balance ──
  const finalBalance = projectionData[projectionData.length - 1]?.balance ?? 0;

  // ── Risk level ──
  const riskLevel = useMemo(() => {
    if (finalBalance < 0) return { label: "Critical",  color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",   dot: "bg-rose-500"   };
    if (finalBalance < 1000) return { label: "High Risk",  color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-500" };
    if (monthlyNet < 200) return { label: "Moderate",   color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-500" };
    return { label: "Safe",       color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200",dot: "bg-emerald-500" };
  }, [finalBalance, monthlyNet]);

  const recurringTransaction = transactions.filter((tx) => tx.recurring.isRecurring === true);

  const recurringIncome : number = transactions
  .filter((tr) => tr.recurring.isRecurring === true && tr.type === 'income')
  .reduce(( sum, tr,) => sum + normalizeToMonthly(tr.amount, tr.recurring.frequency), 0)

  const recurringExpense : number = transactions
  .filter((tr) => tr.recurring.isRecurring === true && tr.type === 'expense')
  .reduce((sum, tr) => sum + normalizeToMonthly(tr.amount, tr.recurring.frequency), 0)

  const hasDeficit = projectionData.some(p => p.balance < 0);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div
        className="px-8 py-6"
        style={{ background: "linear-gradient(135deg, #0f766e, #14b8a6)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
              Projections
            </p>
            <h1 className="text-2xl font-bold text-white">Cash Flow Forecast</h1>
          </div>

          {/* Horizon toggle */}
          <div className="flex items-center gap-1 bg-white/15 border border-white/20 rounded-xl p-1">
            {([3, 6, 12] as Horizon[]).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  horizon === h
                    ? "bg-white text-teal-700 shadow"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {h}M
              </button>
            ))}
          </div>
        </div>

        {/* Key metric cards */}
        <div className="grid grid-cols-3 gap-4">
          {/* Projected balance */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
              Projected Balance ({horizon}M)
            </p>
            <p className={`text-2xl font-bold ${finalBalance < 0 ? "text-rose-300" : "text-white"}`}>
              {finalBalance < 0 ? "-" : ""}{fmt(finalBalance)}
            </p>
            <p className="text-xs text-white/50 mt-1">from {fmt(CURRENT_BALANCE)} today</p>
          </div>

          {/* Monthly net */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
              Monthly Net
            </p>
            <p className={`text-2xl font-bold ${monthlyNet >= 0 ? "text-white" : "text-rose-300"}`}>
              {monthlyNet >= 0 ? "+" : "-"}{fmt(monthlyNet)}
            </p>
            <p className="text-xs text-white/50 mt-1">income minus expenses</p>
          </div>

          {/* Runway or growth */}
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
              {runway !== null ? "Runway" : "Savings Growth"}
            </p>
            <p className={`text-2xl font-bold ${runway !== null ? "text-rose-300" : "text-white"}`}>
              {runway !== null
                ? `${runway} months`
                : `+${fmt(monthlyNet * horizon)}`
              }
            </p>
            <p className="text-xs text-white/50 mt-1">
              {runway !== null ? "until balance depletes" : `over ${horizon} months`}
            </p>
          </div>
        </div>
      </div>

      {/* ── Page Body ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6">

        {/* ── Risk status bar ──────────────────────────────────────────────── */}
        <div className={`flex items-center justify-between rounded-2xl p-4 border ${riskLevel.bg} ${riskLevel.border}`}>
          <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full ${riskLevel.dot} animate-pulse`} />
            <div>
              <p className={`text-sm font-bold ${riskLevel.color}`}>
                Financial Risk: {riskLevel.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {finalBalance < 0
                  ? "Your balance will go negative — reduce expenses or increase income."
                  : finalBalance < 1000
                  ? "Your balance is dangerously low — consider building a buffer."
                  : monthlyNet < 200
                  ? "You're breaking even — small changes could tip you into deficit."
                  : "You're on a healthy trajectory. Keep it up!"}
              </p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${riskLevel.bg} ${riskLevel.color} ${riskLevel.border}`}>
            {riskLevel.label}
          </span>
        </div>

        {/* ── Projected Balance Chart ──────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                Projected Balance
              </h2>
              <p className="text-gray-600 text-sm">Month-by-month balance projection</p>
            </div>
            {hasDeficit && (
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                ⚠️ Deficit detected
              </span>
            )}
          </div>

          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}   />
                  </linearGradient>
                  <linearGradient id="deficitGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}    />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#94a3b8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => 
                      Math.abs(v) >= 1000 
                        ? `$${(v / 1000).toFixed(1)}k` 
                        : `$${v}`
                  }
                  width={48}
                />

                <Tooltip content={<ForecastTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />

                {/* Zero reference line */}
                <ReferenceLine
                  y={0}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{ value: "Zero", position: "insideTopRight", fontSize: 11, fill: "#f43f5e" }}
                />

                <Area
                  type="monotone"
                  dataKey="balance"
                  fill={hasDeficit ? "url(#deficitGradient)" : "url(#balanceGradient)"}
                  stroke="none"
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke={finalBalance < 0 ? "#f43f5e" : "#14b8a6"}
                  strokeWidth={2.5}
                  dot={(props: any) => {
                    const { cx, cy, payload } = props;
                    if (!payload.projected) return (
                      <circle key={`dot-now`} cx={cx} cy={cy} r={5} fill="#0f766e" stroke="white" strokeWidth={2} />
                    );
                    return payload.balance < 0
                      ? <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={4} fill="#f43f5e" stroke="white" strokeWidth={2} />
                      : <circle key={`dot-${payload.month}`} cx={cx} cy={cy} r={3} fill="#14b8a6" stroke="white" strokeWidth={2} />;
                  }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Chart legend */}
          <div className="flex items-center justify-center gap-6 mt-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-teal-400" />
              <span className="text-xs font-medium text-gray-400">Projected balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-rose-400" style={{ borderTop: "2px dashed #f87171" }} />
              <span className="text-xs font-medium text-gray-400">Zero line</span>
            </div>
          </div>
        </div>

        {/* ── Bottom two columns ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT: Recurring Items ─────────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  Recurring Items
                </h2>
                <p className="text-gray-500 text-xs">Fixed transactions factored into forecast</p>
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-teal-50 border border-teal-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Monthly In</p>
                <p className="text-lg font-bold text-teal-700">+{fmt(recurringIncome)}</p>
              </div>
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-1">Monthly Out</p>
                <p className="text-lg font-bold text-rose-600">-{fmt(recurringExpense)}</p>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              {recurringTransaction.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
                      item.type === "income" ? "bg-teal-50 text-teal-600" : "bg-rose-50 text-rose-500"
                    }`}>
                      {item.type === "income" ? "💰" : "💸"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 leading-tight">{item.category}</p>
                      <p className="text-xs text-gray-400 capitalize">{item.recurring.frequency}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    item.type === "income" ? "text-teal-600" : "text-rose-500"
                  }`}>
                    {item.type === "income" ? "+" : "-"}{fmt(item.amount)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-300 mt-4 text-center">
              Based on transactions marked as recurring
            </p>
          </div>

          {/* RIGHT: What-If Simulator ──────────────────────────────────────── */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                What-If Simulator
              </h2>
              <p className="text-gray-500 text-xs">Adjust variables and see the forecast update instantly</p>
            </div>

            <div className="space-y-5">

              {/* Income change */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600">Income Change</label>
                  <span className={`text-sm font-bold ${whatIf.incomeChange >= 0 ? "text-teal-600" : "text-rose-500"}`}>
                    {whatIf.incomeChange >= 0 ? "+" : ""}{fmt(whatIf.incomeChange)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="-2000"
                  max="5000"
                  step="100"
                  value={whatIf.incomeChange}
                  onChange={(e) => setWhatIf(p => ({ ...p, incomeChange: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${((whatIf.incomeChange + 2000) / 7000) * 100}%, #e5e7eb ${((whatIf.incomeChange + 2000) / 7000) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>-$2,000</span><span>+$5,000</span>
                </div>
              </div>

              {/* Expense change */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600">Expense Change</label>
                  <span className={`text-sm font-bold ${whatIf.expenseChange <= 0 ? "text-teal-600" : "text-rose-500"}`}>
                    {whatIf.expenseChange >= 0 ? "+" : ""}{fmt(whatIf.expenseChange)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="-1000"
                  max="3000"
                  step="50"
                  value={whatIf.expenseChange}
                  onChange={(e) => setWhatIf(p => ({ ...p, expenseChange: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f43f5e 0%, #f43f5e ${((whatIf.expenseChange + 1000) / 4000) * 100}%, #e5e7eb ${((whatIf.expenseChange + 1000) / 4000) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>-$1,000</span><span>+$3,000</span>
                </div>
              </div>

              {/* Extra savings */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600">Extra Monthly Savings</label>
                  <span className="text-sm font-bold text-teal-600">
                    +{fmt(whatIf.extraSavings)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={whatIf.extraSavings}
                  onChange={(e) => setWhatIf(p => ({ ...p, extraSavings: Number(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${(whatIf.extraSavings / 2000) * 100}%, #e5e7eb ${(whatIf.extraSavings / 2000) * 100}%, #e5e7eb 100%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-300 mt-1">
                  <span>$0</span><span>+$2,000</span>
                </div>
              </div>
            </div>

            {/* Reset */}
            {(whatIf.incomeChange !== 0 || whatIf.expenseChange !== 0 || whatIf.extraSavings !== 0) && (
              <button
                onClick={() => setWhatIf({ incomeChange: 0, expenseChange: 0, extraSavings: 0 })}
                className="mt-5 w-full py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
              >
                Reset to actual values
              </button>
            )}

            {/* Adjusted summary */}
            <div className="mt-5 p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Adjusted Monthly Summary
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Projected Income</span>
                <span className="font-semibold text-teal-600">+{fmt(adjustedIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Projected Expenses</span>
                <span className="font-semibold text-rose-500">-{fmt(adjustedExpense)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-gray-200 pt-2 mt-2">
                <span className="font-semibold text-gray-700">Monthly Net</span>
                <span className={`font-bold ${monthlyNet >= 0 ? "text-teal-600" : "text-rose-600"}`}>
                  {monthlyNet >= 0 ? "+" : "-"}{fmt(monthlyNet)}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-300 mt-4 text-center">
              Forecast confidence based on {distinctMonths} months of data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForecastPage;