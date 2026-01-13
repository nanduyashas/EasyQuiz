import React from "react";

function ResultSummary({ result }) {
  if (!result) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <div className="summary-box">
        <p>Correct</p>
        <h2 className="text-green-600">{result.correct}</h2>
      </div>

      <div className="summary-box">
        <p>Wrong</p>
        <h2 className="text-red-600">{result.wrong}</h2>
      </div>

      <div className="summary-box">
        <p>Skipped</p>
        <h2 className="text-gray-600">{result.skipped}</h2>
      </div>

      <div className="summary-box">
        <p>Accuracy</p>
        <h2 className="text-indigo-600">{result.accuracy}%</h2>
      </div>
    </div>
  );
}

export default ResultSummary;
