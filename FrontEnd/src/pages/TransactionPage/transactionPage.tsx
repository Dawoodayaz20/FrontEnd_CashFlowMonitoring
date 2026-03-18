import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import AddTransactionModal from "../../components/transactionModal/addTransaction";
import useTransactionStore from "../../store/useTransactionStore";
import type { Transaction, TransactionForm, TxType } from "../../../types";
import useFormatters from "../../useFormatters";

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = "date" | "amount";
type SortDir = "asc" | "desc";

interface TransactionPageProps {
  type: TxType;
}

// ─── Theme config per type ────────────────────────────────────────────────────

const THEME = {
  income: {
    accent:       "#0f766e",
    accentLight:  "#14b8a6",
    bg:           "bg-teal-600",
    bgLight:      "bg-teal-50",
    bgHover:      "hover:bg-teal-700",
    border:       "border-teal-200",
    text:         "text-teal-700",
    textAccent:   "text-teal-600",
    ring:         "focus:ring-teal-200",
    gradient:     "linear-gradient(135deg, #0f766e, #14b8a6)",
    barColor:     "#14b8a6",
    sign:         "+",
    amountColor:  "text-teal-600",
    icon:         "💰",
    label:        "Income",
  },
  expense: {
    accent:       "#be123c",
    accentLight:  "#f43f5e",
    bg:           "bg-rose-600",
    bgLight:      "bg-rose-50",
    bgHover:      "hover:bg-rose-700",
    border:       "border-rose-200",
    text:         "text-rose-700",
    textAccent:   "text-rose-600",
    ring:         "focus:ring-rose-200",
    gradient:     "linear-gradient(135deg, #be123c, #f43f5e)",
    barColor:     "#f43f5e",
    sign:         "-",
    amountColor:  "text-rose-600",
    icon:         "💸",
    label:        "Expenses",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `$${n.toLocaleString()}`;

const monthLabel = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

// ─── Sub-components ───────────────────────────────────────────────────────────

const ActionMenu: React.FC<{
  onEdit: () => void;
  onDelete: () => void;
}> = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition text-sm"
      >
        ···
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-32 text-sm">
            <button
              onClick={() => { onEdit(); setOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium transition"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-500 font-medium transition"
            >
              🗑️ Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const TransactionPage: React.FC<TransactionPageProps> = ({ type }) => {
  const th = THEME[type];

  const { transactions, loading, error, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactionStore();
  const { formatDate, formatCurrency } = useFormatters();

  // ── Fetch on mount / type change ──
  useEffect(() => {
    fetchTransactions(type);
    console.log(transactions)
  }, [type]);

  // ── Date navigation state ──
  const now = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  // ── Filter / sort / search state ──
  const [search,   setSearch]   = useState("");
  const [sortKey,  setSortKey]  = useState<SortKey>("date");
  const [sortDir,  setSortDir]  = useState<SortDir>("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  // ── Modal state ──
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // ── Filter by month or custom date range ──
  const monthFiltered = useMemo(() => {
    return transactions.filter((tx) => {
      if (dateFrom && tx.date < dateFrom) return false;
      if (dateTo   && tx.date > dateTo)   return false;
      if (!dateFrom && !dateTo) {
        const d = new Date(tx.date);
        if (d.getFullYear() !== year || d.getMonth() + 1 !== month) return false;
      }
      return true;
    });
  }, [transactions, year, month, dateFrom, dateTo]);

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Category", "Amount", "Note", "Recurring"];
    
    const rows = monthFiltered.map(tx => [
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
    if(dateFrom && dateTo){
      const year1 = (new Date(dateFrom).getFullYear())
      const month1 = new Date(dateFrom).toLocaleDateString('default', {'month': 'long'});
      const date1 = new Date(dateFrom).toLocaleDateString('default', {'day': "numeric"});
      const date2 = new Date(dateTo).toLocaleDateString('default', {'day': "numeric"});
      const month2 = new Date(dateTo).toLocaleDateString('default', {'month': 'long'});
      a.download = `${date1} ${month1} to ${date2} ${month2} - ${year1} transactions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      a.download = `${new Date(year, month - 1).toLocaleDateString('default', {'month': 'long'})} ${type} transactions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }    
  };

  // ── Search + sort ──
  const displayed = useMemo(() => {
    let rows = monthFiltered.filter((tx) => {
      const q = search.toLowerCase();
      return (
        tx.category.toLowerCase().includes(q) ||
        (tx.note ?? "").toLowerCase().includes(q)
      );
    });
    rows.sort((a, b) => {
      const mul = sortDir === "asc" ? 1 : -1;
      if (sortKey === "amount") return (a.amount - b.amount) * mul;
      return a.date.localeCompare(b.date) * mul;
    });
    return rows;
  }, [monthFiltered, search, sortKey, sortDir]);

  // ── Summary stats ──
  const total  = monthFiltered.reduce((s, t) => s + t.amount, 0);
  const avg    = monthFiltered.length ? Math.round(total / monthFiltered.length) : 0;
  const topCat = useMemo(() => {
    const map: Record<string, number> = {};
    monthFiltered.forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [monthFiltered]);

  // ── Category bar chart data ──
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    monthFiltered.forEach((t) => { map[t.category] = (map[t.category] ?? 0) + t.amount; });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [monthFiltered]);

  // ── Month navigation ──
  const prevMonth = () => {
    setDateFrom(""); setDateTo("");
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    setDateFrom(""); setDateTo("");
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  // ── Handlers ──
  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
  };

  const handleModalSubmit = async (form: TransactionForm) => {
    if (editingTx) {
      await updateTransaction(editingTx._id, form);
    } else {
      await addTransaction(form);
    }
    setEditingTx(null);
  };

  // ── Map editingTx → modal initial form ──
  const editInitialData: Partial<TransactionForm> | undefined = editingTx
    ? {
        type: editingTx.type,
        amount: String(editingTx.amount),
        category: editingTx.category,
        note: editingTx.note ?? "",
        date: editingTx.date.split("T")[0],
        isRecurring: editingTx.recurring.isRecurring,
        frequency: editingTx.recurring.frequency ?? "monthly",
        endDate: editingTx.recurring.endDate?.split("T")[0] ?? "",
      }
    : undefined;
    
  // console.log(new Date(year, month - 1).toLocaleDateString('default', {'month': 'short'}));
  // console.log(month)
  // console.log(new Date(dateTo).toLocaleDateString('default', {'month': 'long'}))
  // console.log(new Date(dateFrom).getFullYear())

  // const year1 = (new Date(dateFrom).getFullYear())
  // const month1 = new Date(dateFrom).toLocaleDateString('default', {'month': 'long'});
  // const date1 = new Date(dateFrom).toLocaleDateString('default', {'day': "numeric"});
  // const date2 = new Date(dateTo).toLocaleDateString('default', {'day': "numeric"});
  // const month2 = new Date(dateTo).toLocaleDateString('default', {'month': 'long'});

  // console.log(`${year1} ${date1} ${month1} - ${date2} ${month2}`)
  console.log(transactions)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6" style={{ background: th.gradient }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">
              {monthLabel(year, month)}
            </p>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {th.icon} {th.label}
            </h1>
          </div>
          <button
            onClick={() => { setEditingTx(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-white/20 hover:bg-white/30 text-white border border-white/30 transition active:scale-95"
          >
            + Add {type === "income" ? "Income" : "Expense"}
          </button>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Total {th.label}</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
          </div>
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Avg per Entry</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(avg)}</p>
          </div>
          <div className="bg-white/15 border border-white/20 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Top Category</p>
            <p className="text-2xl font-bold text-white">{topCat}</p>
          </div>
        </div>
      </div>

      {/* ── Page Body ────────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 space-y-6">

        {/* Error Banner */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-sm px-4 py-3 rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* ── Month Navigator + Date Filter ── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-2 shadow-sm">
            <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">←</button>
            <span className="text-sm font-semibold text-gray-700 min-w-[130px] text-center">{monthLabel(year, month)}</span>
            <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition">→</button>
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 transition active:scale-95"
              >
                ⬇️ Export CSV
              </button>
          </div>

          

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Custom range:</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200 text-gray-700" />
            <span className="text-gray-400 text-sm">→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200 text-gray-700" />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-gray-400 hover:text-rose-500 transition font-medium">Clear ✕</button>
            )}
          </div>
        </div>

        {/* ── Category Bar Chart ── */}
        {categoryData.length > 0 && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Category Breakdown</h2>
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={50} />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
                          <p className="font-bold text-gray-800">{fmt(payload[0].value as number)}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={th.barColor} opacity={1 - i * 0.12} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Transactions Table ── */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm ">

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-200 text-gray-700 transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Sort:</span>
              {(["date", "amount"] as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => toggleSort(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                    sortKey === key ? `${th.bg} text-white` : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {key} {sortKey === key ? (sortDir === "asc" ? "↑" : "↓") : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              <span className="animate-pulse">Loading transactions...</span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-300">
              <span className="text-4xl mb-3">{th.icon}</span>
              <p className="font-semibold text-sm">No transactions found</p>
              <p className="text-xs mt-1">Try adjusting your filters or add a new entry</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Date", "Category", "Note", "Recurring", "Amount", ""].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((tx, i) => (
                  <tr
                    key={tx._id}
                    className={`border-b border-gray-50 hover:bg-gray-50/80 transition ${i % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
                  >
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${th.bgLight} ${th.text}`}>{tx.category}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 font-medium">{tx.note ?? "—"}</td>
                    <td className="px-6 py-4">
                      {tx.recurring.isRecurring ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full w-fit">
                          🔁 {tx.recurring.frequency}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 font-bold ${th.amountColor} whitespace-nowrap`}>
                      {th.sign}{fmt(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <ActionMenu
                        onEdit={() => handleEdit(tx)}
                        onDelete={() => handleDelete(tx._id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {displayed.length > 0 && !loading && (
            <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing <span className="font-semibold text-gray-600">{displayed.length}</span> transaction{displayed.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs font-semibold text-gray-600">
                Total: <span className={th.textAccent}>{fmt(displayed.reduce((s, t) => s + t.amount, 0))}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <AddTransactionModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTx(null); }}
        onSubmit={handleModalSubmit}
        initialData={editInitialData}
        transactType={type}
      />
    </div>
  );
};

export default TransactionPage;