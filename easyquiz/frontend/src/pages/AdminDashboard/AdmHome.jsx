import React, { useState, useEffect, useRef } from "react";
import AdminNavbar from "../../components/layouts/AdminNavbar.jsx";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_PATHS } from "../../utils/apiPaths.js";

import "../../index.css";
import "../../admin.css";
import "../../components/CssStyle/admGradesStyles.css";
import "../../components/CssStyle/softBlobBackground.css";

function AdmHome() {
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  // Dashboard States
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [activeStudents, setActiveStudents] = useState(0);

  const [grades, setGrades] = useState([]);
  const [subjectsByGrade, setSubjectsByGrade] = useState({});

  const [leaderboard, setLeaderboard] = useState([]);

  // NEW STATES
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Load Navbar height
  useEffect(() => {
    const handleResize = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch Dashboard Data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.ADMIN.DASHBOARD);

        if (res.data.success) {
          setTotalUsers(res.data.totalUsers || 0);
          setTotalQuizzes(res.data.totalQuizzes || 0);
          setActiveStudents(res.data.activeStudents || 0);

          setGrades(res.data.grades || []);
          setSubjectsByGrade(res.data.subjectsByGrade || {});
          setLeaderboard(res.data.leaderboard || []);
        }
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      }
    };

    loadDashboardData();
  }, []);

  // ⭐⭐⭐ SORT GRADES NUMERICALLY ⭐⭐⭐
  const sortedGrades = [...grades].sort((a, b) => {
    const numA = parseInt(a.name.match(/\d+/)?.[0] || 0);
    const numB = parseInt(b.name.match(/\d+/)?.[0] || 0);
    return numA - numB;
  });

  // Get subjects for selected grade
  const gradeSubjects =
    selectedGrade && subjectsByGrade[selectedGrade]
      ? subjectsByGrade[selectedGrade]
      : [];

  // Get units for selected subject
  const subjectUnits =
    gradeSubjects.find((s) => s.subjectId === selectedSubject)?.units || [];

  return (
    <div className="min-h-screen flex flex-col app-background app-bg-bubble">
      {/* Navbar */}
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <AdminNavbar />
      </header>

      {/* Main Content */}
      <main
        className="flex-1 p-8 overflow-y-auto transition-all duration-500"
        style={{ paddingTop: `${navbarHeight + 130}px` }}
      >
        {/* Title */}
        <div className="text-center animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            View system overview and user statistics.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="summary-card w-[34rem]">
            <p className="summary-label">Total Users</p>
            <p className="summary-value">{totalUsers}</p>
          </div>

          <div className="summary-card w-[34rem]">
            <p className="summary-label">Total Quizzes</p>
            <p className="summary-value">{totalQuizzes}</p>
          </div>

          <div className="summary-card w-[34rem]">
            <p className="summary-label">Active Students</p>
            <p className="summary-value">{activeStudents}</p>
          </div>
        </div>

        {/* GRADES & SUBJECTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          
          {/* GRADE LIST */}
          <div className="p-6 rounded-xl shadow border border-indigo-300 custom-scroll 
            bg-[linear-gradient(155deg,rgba(250,250,255,0.96),rgba(235,238,255,0.94),rgba(210,224,255,0.93))]">
            
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Grades Summary
            </h2>

            <ul className="space-y-8">
              {sortedGrades.map((g) => (
                <li
                  key={g.gradeId}
                  onClick={() => {
                    setSelectedGrade(g.gradeId);
                    setSelectedSubject(null);
                  }}
                  className={`p-3 rounded-lg border border-indigo-300 shadow-sm cursor-pointer transition
            bg-[linear-gradient(155deg,rgba(245,247,255,0.97),rgba(225,233,255,0.95))]
            hover:scale-[1.02]
            ${

                      selectedGrade === g.gradeId
                        ? "ring-2 ring-indigo-500"
                        : ""
                    }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium text-indigo-700">{g.name}</span>
                    <span className="text-indigo-600 text-sm">
                      Students: {g.students}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* SUBJECT LIST */}
          <div className="p-6 rounded-xl shadow border border-indigo-300 custom-scroll 
            bg-[linear-gradient(155deg,rgba(250,250,255,0.96),rgba(235,238,255,0.94),rgba(210,224,255,0.93))]">
            
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Subjects
            </h2>

            {selectedGrade ? (
              <ul className="space-y-3">
                {gradeSubjects.map((s) => (
                  <li
                    key={s.subjectId}
                    onClick={() => setSelectedSubject(s.subjectId)}
                    className={`p-3 rounded-lg border border-indigo-300 shadow-sm cursor-pointer transition
            bg-[linear-gradient(155deg,rgba(245,247,255,0.97),rgba(225,233,255,0.95))]
            hover:scale-[1.02]
            ${

                        selectedSubject === s.subjectId
                          ? "ring-2 ring-purple-500"
                          : ""
                      }`}
                  >
                    <span className="font-medium text-indigo-700">{s.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Select a grade to view subjects.</p>
            )}
          </div>
        </div>

        {/* UNITS */}
        {selectedSubject && (
          <div
            className="
              mt-12 p-6 rounded-2xl shadow-xl border border-indigo-400
              bg-[linear-gradient(155deg,
                rgba(245,248,255,0.98),
                rgba(225,235,255,0.96),
                rgba(205,220,255,0.94),
                rgba(190,210,255,0.93),
                rgba(175,200,255,0.92)
              )]
              backdrop-blur-md
            "
          >
            <h2 className="text-xl font-semibold text-indigo-700 mb-4">
              Units
            </h2>

            {subjectUnits.length > 0 ? (
              <ul className="space-y-4">
                {subjectUnits.map((u, index) => (
                  <li
                    key={index}
                    className="
                      p-4 rounded-xl border border-indigo-200 shadow-md
                      bg-[linear-gradient(155deg,
                        rgba(250,250,255,0.98),
                        rgba(235,240,255,0.96),
                        rgba(215,225,255,0.95)
                      )]
                      hover:scale-[1.015] hover:shadow-lg transition
                    "
                  >
                    <p className="font-semibold text-indigo-800">{u.name}</p>
                    <p className="text-gray-600 text-sm">{u.content}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No units available.</p>
            )}
          </div>
        )}

        {/* LEADERBOARD */}
        <div className="mt-12 p-6 rounded-xl shadow border border-indigo-300 custom-scroll 
          bg-[linear-gradient(155deg,rgba(250,250,255,0.97),rgba(235,242,255,0.95))]">
          
          <h2 className="text-xl font-semibold text-indigo-700 mb-4">
            Student Leaderboard (Top Performers)
          </h2>

          <ul className="space-y-3">
            {leaderboard.map((s, index) => (
              <li
                key={index}
                className="p-3 rounded-lg border shadow-sm flex justify-between bg-white hover:scale-[1.01]"
              >
                <span className="font-medium text-indigo-700">{s.name}</span>
                <span className="font-semibold text-indigo-800">{s.score}%</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}

export default AdmHome;
