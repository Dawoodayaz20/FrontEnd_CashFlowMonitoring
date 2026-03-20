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

export interface SimulatorDataPoint {
  month: string;
  baseline: number;
  simulated: number;
}

interface SimulatorChartProps {
  data: SimulatorDataPoint[];
}

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

const SimulatorChart: React.FC<SimulatorChartProps> = ({ data }) => {
  return (
    <div className="w-full" style={{ height: 220 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="baselineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}   />
            </linearGradient>
            <linearGradient id="simulatedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}   />
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
            tickFormatter= {
            (v) => Math.abs(v) >= 1000 
                    ? `$${(v / 1000).toFixed(1)}k` 
                    : `$${v}`}
            width={45}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }} />

          {/* Baseline — teal, rendered first (behind) */}
          <Area
            type="monotone"
            dataKey="baseline"
            stroke="#14b8a6"
            strokeWidth={2}
            fill="url(#baselineGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#14b8a6" }}
          />

          {/* Simulated — amber, rendered on top */}
          <Area
            type="monotone"
            dataKey="simulated"
            stroke="#f59e0b"
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="url(#simulatedGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: "#f59e0b" }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-teal-400" />
          <span className="text-xs font-medium text-gray-400">Baseline</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400" />
          <span className="text-xs font-medium text-gray-400">Simulated</span>
        </div>
      </div>
    </div>
  );
};

export default SimulatorChart;