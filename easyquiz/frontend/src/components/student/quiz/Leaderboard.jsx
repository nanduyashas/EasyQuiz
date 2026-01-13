import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";

const Leaderboard = ({ quizId, onClose }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quizId) return;

    axiosInstance
      .get(API_PATHS.STD_QUIZ.LEADERBOARD(quizId))
      .then((res) => {
        setData(res.data.leaderboard || []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [quizId]);

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="panel max-w-2xl w-full animate-fadeInExpand">
        <h2 className="text-2xl font-bold text-indigo-700 mb-4 text-center">
          🏆 Leaderboard
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">No attempts yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th>#</th>
                <th>Student</th>
                <th>Score</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.rank}
                  className={`text-center ${
                    row.rank === 1
                      ? "bg-yellow-100 font-bold"
                      : row.rank === 2
                      ? "bg-gray-100"
                      : row.rank === 3
                      ? "bg-orange-100"
                      : ""
                  }`}
                >
                  <td>{row.rank}</td>
                  <td>{row.studentName}</td>
                  <td>{row.score}%</td>
                  <td>{Math.floor(row.timeTakenSeconds / 60)}m</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-right mt-6">
          <button onClick={onClose} className="btn-gradient">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
