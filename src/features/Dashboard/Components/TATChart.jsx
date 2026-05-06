import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Area,
} from "recharts";

//////////////////////////////////////////////////////
// Date format
//////////////////////////////////////////////////////
const formatChartDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

//////////////////////////////////////////////////////
// Mock API data
//////////////////////////////////////////////////////
const mockData = [
  { date: "2026-03-10", tat: 18 },
  { date: "2026-03-11", tat: 22 },
  { date: "2026-03-12", tat: 20 },
  { date: "2026-03-13", tat: 25 },
  { date: "2026-03-14", tat: 21 },
  { date: "2026-03-15", tat: 19 },
  { date: "2026-03-16", tat: 17 },
];

const TATChart = () => {
  const [filter, setFilter] = useState(7);
  const [data, setData] = useState([]);

  useEffect(() => {
    // 👉 future me yaha API call hoga
    // const res = await getTatData(filter)

    setData(mockData);
  }, [filter]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase">
          Turnaround Time (TAT) Trends
        </h2>

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

      {/* Chart */}
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>

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
            formatter={(value) => [`${value}`, "TAT"]}
          />

          <Area
            type="monotone"
            dataKey="tat"
            stroke="none"
            fill="url(#colorBlue)"
          />

          <Line
            type="monotone"
            dataKey="tat"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TATChart;
