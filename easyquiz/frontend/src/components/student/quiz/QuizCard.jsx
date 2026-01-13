import React from "react";
import { FaPlay, FaLock, FaCheckCircle } from "react-icons/fa";

const QuizCard = ({ quiz, onStart, canStart }) => {
  const isRanked = quiz.affectsRank || quiz.type === "ranked";
  const attempted = quiz.attempted === true;

  const isLocked = isRanked && attempted;

  return (
    <div className="dashboard-card animate-fadeIn">

      {/* TITLE */}
      <h3 className="text-xl font-bold text-indigo-800 mb-1">
        {quiz.title}
      </h3>

      {/* META */}
      <p className="text-sm text-gray-600 mb-2">
        {quiz.grade} → {quiz.subject} → {quiz.unit}
      </p>

      <p className="text-sm text-gray-700 mb-3">
        {quiz.description}
      </p>

      <p className="text-sm text-gray-500 mb-3">
        ⏱ {quiz.timeMinutes} min • ❓ {quiz.questions.length}
      </p>

      {/* BADGE */}
      {isRanked ? (
        attempted ? (
          <span className="inline-flex items-center gap-1 mb-3 px-3 py-1 text-xs font-semibold rounded-full
            bg-green-100 text-green-700">
            <FaCheckCircle /> Completed
          </span>
        ) : (
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold rounded-full
            bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 text-white">
            🏆 Ranked Quiz
          </span>
        )
      ) : (
        <span className="inline-block mb-3 px-3 py-1 text-xs rounded-full
          bg-gray-200 text-gray-700">
          📝 Practice Quiz
        </span>
      )}

      {/* SCORE (ONLY FOR RANKED + ATTEMPTED) */}
      {isRanked && attempted && typeof quiz.score === "number" && (
        <div className="text-sm text-green-700 font-semibold mb-2">
          Score: {quiz.score}%
        </div>
      )}

      {/* START / LOCK BUTTON */}
      <button
        disabled={isLocked || !canStart}
        onClick={() => !isLocked && canStart && onStart(quiz)}
        className={`w-full mt-2 px-4 py-2 rounded-md flex items-center justify-center gap-2
          transition
          ${
            isLocked
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
      >
        {isLocked ? (
          <>
            <FaLock /> Locked
          </>
        ) : (
          <>
            <FaPlay /> Start
          </>
        )}
      </button>

      {/* RANKED WARNING */}
      {isRanked && !attempted && (
        <p className="mt-2 text-xs text-rose-600 text-center">
          ⚠ One attempt only • Affects your rank
        </p>
      )}
    </div>
  );
};

export default QuizCard;
