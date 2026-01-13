// frontend/src/components/Charts/StudentProgressLineChart.jsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const StudentProgressLineChart = ({ data = [], grade = "Grade" }) => {
  // defensive defaults (avoid crashes when data is undefined)
  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold text-indigo-700 mb-3 text-center">
        {grade} Performance by Subject
      </h3>

      {/* Chart box with explicit height so ResponsiveContainer can compute size */}
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
            <XAxis dataKey="subject" stroke="#4f46e5" />
            <YAxis stroke="#4f46e5" domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 5, fill: "#818cf8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudentProgressLineChart;
