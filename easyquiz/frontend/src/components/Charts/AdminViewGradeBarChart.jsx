import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

const AdminViewGradeBarChart = ({ grades = [] }) => {
  // build chart data
  const data = useMemo(() => {
    return grades.map((g) => ({
      grade: g.name,
      students: g.students ? g.students.length : 0,
    }));
  }, [grades]);

  // Prevent rendering when container is not ready → avoids width=-1 error
  if (!grades || grades.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "360px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        No grade data available.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "360px", minHeight: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 6, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E0E7FF" />

          <XAxis
            dataKey="grade"
            tick={{ fill: "#4F46E5", fontSize: 13, fontWeight: 500 }}
            interval={0}
            height={40}
          />

          <YAxis
            allowDecimals={false}
            tick={{ fill: "#4F46E5", fontSize: 12 }}
          />

          <Tooltip
            cursor={{ fill: "rgba(99,102,241,0.1)" }}
            wrapperStyle={{
              borderRadius: 8,
              border: "1px solid #C7D2FE",
              boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            }}
            contentStyle={{
              borderRadius: 8,
              backgroundColor: "#ffffff",
              border: "none",
              padding: "10px 14px",
            }}
          />

          <Bar
            dataKey="students"
            name="Students"
            radius={[8, 8, 0, 0]}
            fill="#6366F1"
            stroke="#4F46E5"
            strokeWidth={1.5}
            activeBar={{ fill: "#4F46E5" }}
          >
            <LabelList
              dataKey="students"
              position="top"
              style={{ fill: "#4F46E5", fontWeight: "600" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminViewGradeBarChart;
