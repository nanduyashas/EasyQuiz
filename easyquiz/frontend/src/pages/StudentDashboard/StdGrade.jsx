import React, { useEffect, useState, useRef } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";
import { FaChartBar, FaStar, FaBook, FaLayerGroup } from "react-icons/fa";
import StudentResultChartbar from "../../components/Charts/StudentResultChartbar";

const ATTEMPT_KEY = "easyquiz_student_quiz_attempts_v1";

function StdGrade() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);
  const [attempts, setAttempts] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [chartData, setChartData] = useState([]);

  // Load attempts
  useEffect(() => {
    const raw = localStorage.getItem(ATTEMPT_KEY);
    if (raw) {
      try {
        const attemptList = JSON.parse(raw);
        setAttempts(attemptList);

        const grades = [...new Set(attemptList.map((a) => a.grade))];
        if (grades.length > 0) setSelectedGrade(grades[0]);
      } catch {
        console.warn("Invalid attempt data");
      }
    }
  }, []);

  // Navbar height
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // Update subjects & chart data
  useEffect(() => {
    if (!selectedGrade) return;

    const filtered = attempts.filter((a) => a.grade === selectedGrade);

    const subjectList = [...new Set(filtered.map((a) => a.subject))];
    setSubjects(subjectList);

    const chartValues = subjectList.map((subj) => {
      const subs = filtered.filter((a) => a.subject === subj);
      const avg = Math.round(subs.reduce((s, v) => s + v.score, 0) / subs.length);
      return { subject: subj, score: avg };
    });

    setChartData(chartValues);
  }, [selectedGrade, attempts]);

  // Color logic
  const getBarColor = (score) => {
    if (score <= 34) return { bg: "bg-red-500", label: "Retry" };
    if (score <= 54) return { bg: "bg-yellow-400", label: "Keep Trying" };
    if (score <= 64) return { bg: "bg-green-500", label: "Good" };
    if (score <= 74) return { bg: "bg-blue-500", label: "Well Done" };
    return { bg: "bg-purple-600", label: "Excellent" };
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      {/* Main */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all"
        style={{ paddingTop: `${navbarHeight + 130}px` }}
      >
        <h1 className="text-3xl font-bold text-indigo-700 mb-6 flex items-center gap-2">
          <FaChartBar /> My Grade Performance
        </h1>

        {/* Grade Selector */}
        <div className="flex items-center gap-4 mb-8">
          <label className="font-semibold text-indigo-700 flex items-center gap-2">
            <FaLayerGroup /> Select Grade:
          </label>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="p-2 border border-indigo-200 rounded-md bg-white"
          >
            {[...new Set(attempts.map((a) => a.grade))].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* No Data */}
        {subjects.length === 0 ? (
          <p className="text-gray-500 text-lg">
            No quiz results available yet for this grade.
          </p>
        ) : (
          <>
            {/* Chart */}
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaBook /> Subject Performance Chart
            </h2>

            <StudentResultChartbar chartData={chartData} />

            {/* Summary */}
            <h2 className="text-2xl font-semibold text-indigo-700 mt-10 mb-4 flex items-center gap-2">
              <FaStar /> Overall Summary
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {chartData.map((item, idx) => {
                const bar = getBarColor(item.score);
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-white/80 border border-indigo-100 shadow-lg"
                  >
                    <h3 className="font-bold text-indigo-800 text-lg">
                      {item.subject}
                    </h3>
                    <p className="text-gray-600 mt-1 text-sm">
                      Average Marks: {item.score}%
                    </p>
                    <p
                      className="mt-2 px-3 py-1 rounded-full text-white text-center text-sm font-semibold"
                      style={{
                        backgroundColor:
                          bar.bg
                            .replace("bg-", "")
                            .replace("-500", "")
                            .replace("-400", "")
                            .replace("-600", ""),
                      }}
                    >
                      {bar.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default StdGrade;
