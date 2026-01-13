import React from "react";
import "../../index.css";
import "../../student.css";

/*
    PROPS REQUIRED:
    chartData = [
      { subject: "Math", score: 78 },
      { subject: "Science", score: 45 },
      ...
    ]
*/

function StudentResultChartbar({ chartData }) {
  const getBarColor = (score) => {
    if (score <= 34) return { bg: "bg-red-500", label: "Retry" };
    if (score <= 54) return { bg: "bg-yellow-400", label: "Keep Trying" };
    if (score <= 64) return { bg: "bg-green-500", label: "Good" };
    if (score <= 74) return { bg: "bg-blue-500", label: "Well Done" };
    return { bg: "bg-purple-600", label: "Excellent" };
  };

  return (
    <div className="w-full bg-white/80 rounded-xl p-8 shadow-lg border border-indigo-100">
      <div className="flex items-end gap-6 overflow-x-auto pb-6">

        {chartData.length === 0 && (
          <p className="text-center text-gray-500 w-full text-lg">
            No data available for this grade.
          </p>
        )}

        {chartData.map((item, idx) => {
          const bar = getBarColor(item.score);

          return (
            <div key={idx} className="flex flex-col items-center min-w-[80px]">
              {/* Y-Axis */}
              <span className="text-sm font-semibold text-indigo-700 mb-2">
                {item.score}%
              </span>

              {/* BAR */}
              <div
                className={`w-12 ${bar.bg} rounded-t-xl flex items-center justify-center text-white text-[10px] font-bold`}
                style={{
                  height: `${Math.max(item.score * 2, 12)}px`,
                  transition: "all .4s ease-out",
                }}
              >
                {bar.label}
              </div>

              {/* X-Axis (Subject) */}
              <span className="mt-3 text-indigo-900 text-sm font-medium text-center">
                {item.subject}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}

export default StudentResultChartbar;
