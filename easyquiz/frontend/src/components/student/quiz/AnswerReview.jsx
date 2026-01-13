import React from "react";

function AnswerReview({ questions = [], answers = {}, result }) {
  if (!Array.isArray(questions) || questions.length === 0) return null;
  if (!result || !result.correctAnswers) return null;

  return (
    <div className="mt-6 text-left">
      <h3 className="text-xl font-bold mb-4">Answer Review</h3>

      {questions.map((q, index) => {
        const userAnswer = answers[q.id] || null;
        const correctAnswer = result.correctAnswers[q.id];

        return (
          <div
            key={q.id}
            className="mb-4 p-4 border rounded-lg bg-gray-50"
          >
            <p className="font-semibold mb-2">
              Q{index + 1}. {q.text}
            </p>

            <ul className="ml-4">
              {["a", "b", "c", "d"].map((opt, i) => {
                const isCorrect = opt === correctAnswer;
                const isWrong = opt === userAnswer && opt !== correctAnswer;

                return (
                  <li
                    key={opt}
                    className={`mb-1 ${
                      isCorrect
                        ? "text-green-600 font-bold"
                        : isWrong
                        ? "text-red-600"
                        : "text-gray-700"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}. {q[opt]}
                    {isCorrect && " ✅ Correct"}
                    {isWrong && " ❌ Your Answer"}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default AnswerReview;
