import React from "react";

const QuestionPalette = ({ questions, currentIndex, answers, flags, onJump }) => {
  return (
    <div className="flex flex-wrap gap-2 mt-6">
      {questions.map((q, i) => {
        let color = "bg-gray-200";
        if (flags[q.id]) color = "bg-red-400 text-white";
        else if (answers[q.id] !== undefined) color = "bg-green-500 text-white";
        if (i === currentIndex) color = "bg-indigo-600 text-white";

        return (
          <button
            key={q.id}
            onClick={() => onJump(i)}
            className={`w-9 h-9 rounded-full font-semibold ${color}`}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionPalette;
