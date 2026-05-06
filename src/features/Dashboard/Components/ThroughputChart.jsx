import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

//////////////////////////////////////////////////////
// 📌 Mock Data (server jaisa format)
//////////////////////////////////////////////////////
const data = [
  { date: "2026-03-10", completed: 45, dispatched: 50 },
  { date: "2026-03-11", completed: 52, dispatched: 48 },
  { date: "2026-03-12", completed: 48, dispatched: 60 },
  { date: "2026-03-13", completed: 60, dispatched: 58 },
  { date: "2026-03-14", completed: 55, dispatched: 62 },
  { date: "2026-03-15", completed: 30, dispatched: 35 },
];

//////////////////////////////////////////////////////
// 📌 Date format
//////////////////////////////////////////////////////

//////////////////////////////////////////////////////
// 📌 Component
//////////////////////////////////////////////////////
const ThroughputChart = () => {
  const [filter, setFilter] = useState(7);
  const formatChartDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase">
          Daily Throughput
        </h2>

        {/* Legend */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-black"></span>
            Completed
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Dispatched
          </div>
          <select
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-gray-50"
            value={filter}
            onChange={(e) => setFilter(Number(e.target.value))}
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={60}>Last 60 Days</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          <XAxis
            dataKey="date"
            tickFormatter={formatChartDate}
            tickLine={false}
            axisLine={false}
          />

          <YAxis tickLine={false} axisLine={false} />

          <Tooltip
            labelFormatter={formatChartDate}
            formatter={(value, name) => [value, name]}
          />

          {/* Bars */}
          <Bar dataKey="completed" fill="#0F172A" radius={[6, 6, 0, 0]} />

          <Bar dataKey="dispatched" fill="#3B82F6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ThroughputChart;
