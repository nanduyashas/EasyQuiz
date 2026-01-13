import React from "react";

function QuizStats({ totalQuizzes = 0, totalAttempts = 0, avgScore = 0 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Available Quizzes */}
      <div className="student-card p-4 text-center">
        <h4 className="text-sm text-indigo-600 font-semibold">
          Available Quizzes
        </h4>
        <p className="text-2xl md:text-3xl font-bold text-indigo-800">
          {totalQuizzes}
        </p>
      </div>

      {/* Attempts */}
      <div className="student-card p-4 text-center">
        <h4 className="text-sm text-indigo-600 font-semibold">
          Attempts
        </h4>
        <p className="text-2xl md:text-3xl font-bold text-indigo-800">
          {totalAttempts}
        </p>
      </div>

      {/* Average Score */}
      <div className="student-card p-4 text-center">
        <h4 className="text-sm text-indigo-600 font-semibold">
          Average Score
        </h4>
        <p className="text-2xl md:text-3xl font-bold text-indigo-800">
          {avgScore}%
        </p>
      </div>
    </div>
  );
}

export default QuizStats;
