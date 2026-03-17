import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// ─── Types ────────────────────────────────────────────────────────────────────

interface DataPoint {
  month: string;
  income: number;
  expense: number;
}

interface AreaChartCompProps {
  data?: DataPoint[];
}

// ─── Default Static Data (replace with real data later) ───────────────────────

const defaultData: DataPoint[] = [
  { month: "Jan",   income: 3000, expense: 1800 },
  { month: "Feb",   income: 4000, expense: 2200 },
  { month: "Mar",   income: 2000, expense: 1500 },
  { month: "Apr",   income: 1500, expense: 1300 },
  { month: "May",   income: 1800, expense: 900  },
  { month: "Jun",   income: 2400, expense: 1100 },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

interface TooltipEntry {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
        {label}
      </p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500 capitalize">{entry.name}:</span>
          <span className="font-bold text-gray-800">${entry.value.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────

const AreaChartComp: React.FC<AreaChartCompProps> = ({ data }) => {
  return (
    <div className="w-full" style={{ height: 280 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {/* Teal gradient for income */}
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}    />
            </linearGradient>
            {/* Rose gradient for expense */}
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}   />
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
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={45}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />

          {/* Expense area — rendered first so income sits on top */}
          <Area
            type="monotone"
            dataKey="expense"
            stroke="#f43f5e"
            strokeWidth={2}
            fill="url(#expenseGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#f43f5e" }}
          />

          {/* Income area */}
          <Area
            type="monotone"
            dataKey="income"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#14b8a6" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span className="text-xs font-medium text-gray-400">Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-400" />
          <span className="text-xs font-medium text-gray-400">Expense</span>
        </div>
      </div>
    </div>
  );
};

export default AreaChartComp;