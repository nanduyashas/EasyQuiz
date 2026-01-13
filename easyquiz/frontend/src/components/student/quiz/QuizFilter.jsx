import React from "react";

const QuizFilter = ({ filter, setFilter }) => {
  return (
    <div className="flex gap-3 mb-6">
      {["all", "practice", "ranked"].map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`px-4 py-2 rounded-lg text-sm
            ${
              filter === f
                ? "btn-gradient text-white"
                : "bg-white shadow-soft"
            }`}
        >
          {f.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default QuizFilter;
