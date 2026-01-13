import React, { useState, useEffect, useRef } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";

import {
  FaBookOpen,
  FaLayerGroup,
  FaCheckCircle,
  FaPlay,
  FaArrowLeft,
  FaLock,
} from "react-icons/fa";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { useNavigate } from "react-router-dom";

const PROGRESS_KEY = "easyquiz_student_progress_v2";

function StdSubject() {
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  const [navbarHeight, setNavbarHeight] = useState(85);
  const [loading, setLoading] = useState(true);

  const [studentGradeId, setStudentGradeId] = useState("");
  const [studentGradeName, setStudentGradeName] = useState("");

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [progress, setProgress] = useState({});
  const [quizList, setQuizList] = useState([]);

  /* ================= NAVBAR HEIGHT ================= */
  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /* ================= LOAD SAVED PROGRESS ================= */
  useEffect(() => {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (raw) {
      try {
        setProgress(JSON.parse(raw));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }, [progress]);

  /* ================= LOAD STUDENT PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.STUDENT.PROFILE);
        const gradeObj = res.data?.profile?.grade;
        if (gradeObj) {
          setStudentGradeId(gradeObj.gradeId);
          setStudentGradeName(gradeObj.name);
        }
      } catch {
        console.log("Failed to load student profile");
      }
    };
    loadProfile();
  }, []);

  /* ================= LOAD SUBJECTS ================= */
  useEffect(() => {
    if (!studentGradeId) return;

    const loadSubjects = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(API_PATHS.STUDENT.SUBJECTS);
        const apiSubjects = res.data?.subjects || [];

        setSubjects(
          apiSubjects.map((s) => ({
            subjectId: s._id,
            name: s.name,
            units: (s.units || []).map((u) => ({
              id: u._id,
              name: u.name,
              content: u.content,
            })),
          }))
        );
      } catch {
        console.log("Failed to load subjects");
      } finally {
        setLoading(false);
      }
    };

    loadSubjects();
  }, [studentGradeId]);

  /* ================= LOAD QUIZZES ================= */
  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.STD_QUIZ.LIST);
        setQuizList(res.data?.quizzes || []);
      } catch {
        console.log("Failed to load quizzes");
      }
    };
    loadQuizzes();
  }, []);

  /* ================= HELPERS ================= */
  const currentSubject =
    subjects.find((s) => s.subjectId === selectedSubjectId) || null;

  const toggleComplete = (subjectId, unitId) => {
    const key = `${subjectId}_${unitId}`;
    setProgress((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getProgressPercent = (subjectId) => {
    const subject = subjects.find((s) => s.subjectId === subjectId);
    if (!subject || !subject.units.length) return 0;
    const completed = subject.units.filter(
      (u) => progress[`${subjectId}_${u.id}`]
    ).length;
    return Math.round((completed / subject.units.length) * 100);
  };

  const getQuizForUnit = (subjectId, unitName) =>
    quizList.find(
      (q) => q.subjectId === subjectId && q.unit === unitName
    );

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="fixed top-0 left-0 w-full z-50">
        <StudentNavbar />
      </header>

      <main
        className="flex-1 p-8 overflow-y-auto"
        style={{ paddingTop: navbarHeight + 120 }}
      >
       {/* ===== PAGE HEADER ===== */}
<div className="text-center mb-12">
  <h1
    className="text-4xl md:text-5xl font-extrabold mb-4
               text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-700 to-purple-800 bg-clip-text text-transparent"
  >
    My Subjects & Units
  </h1>

  {studentGradeName && (
    <p className="text-lg md:text-xl text-gray-600 flex justify-center items-center gap-2">
       <span className="font-semibold">Your Grade:</span> {studentGradeName}
    </p>
  )}
</div>


        {/* SUBJECT LIST */}
        {selectedSubjectId === "" && (
          <>
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 flex items-center gap-2">
              <FaLayerGroup /> Subjects
            </h2>

            {loading ? (
              <p>Loading subjects...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {subjects.map((s) => (
                  <div
                    key={s.subjectId}
                    onClick={() => setSelectedSubjectId(s.subjectId)}
                    className="student-card p-5 rounded-xl shadow bg-white/80 border hover:shadow-lg cursor-pointer"
                  >
                    <h2 className="text-xl font-semibold text-indigo-700 flex gap-2">
                      <FaBookOpen /> {s.name}
                    </h2>
                    <p className="text-gray-600">{s.units.length} Units</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Progress:{" "}
                      <strong className="text-indigo-700">
                        {getProgressPercent(s.subjectId)}%
                      </strong>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* UNIT LIST */}
        {selectedSubjectId && currentSubject && (
          <div>
            {/* ✅ FIXED BACK BUTTON */}
           <button
  type="button"
  onClick={() => setSelectedSubjectId("")}
  className="mb-6 inline-flex items-center gap-2 px-4 py-2
             rounded-lg bg-white shadow
             hover:shadow-md text-indigo-600
             font-semibold transition"
>
  <FaArrowLeft />
  Back to Subjects
</button>


            <h3 className="text-2xl font-semibold text-indigo-800 mb-4">
              {currentSubject.name} Units
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {currentSubject.units.map((u) => {
                const quiz = getQuizForUnit(selectedSubjectId, u.name);
                const hasQuiz = !!quiz;
                const done = progress[`${selectedSubjectId}_${u.id}`];

                return (
                  <div
                    key={u.id}
                    className={`p-5 rounded-xl border shadow ${
                      done
                        ? "bg-green-50 border-green-300"
                        : "bg-white border-indigo-100"
                    }`}
                  >
                    <h4 className="font-semibold text-indigo-800">{u.name}</h4>
                    <p className="text-gray-700 text-sm">{u.content}</p>

                    <button
                      onClick={() =>
                        toggleComplete(selectedSubjectId, u.id)
                      }
                      className={`mt-3 px-3 py-1 rounded text-sm ${
                        done
                          ? "bg-green-600 text-white"
                          : "bg-indigo-600 text-white"
                      }`}
                    >
                      {done ? <FaCheckCircle /> : "Mark Complete"}
                    </button>
<button
  disabled={!hasQuiz}
  onClick={() => {
    if (!hasQuiz) return;

    // store selected quiz id safely
    localStorage.setItem("easyquiz_selected_quiz_id", quiz.id);

    // navigate to quiz page
    navigate("/studentquiz");
  }}
  className={`mt-4 w-full py-2 rounded flex justify-center gap-2 ${
    hasQuiz
      ? "bg-purple-600 text-white hover:bg-purple-700"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {hasQuiz ? (
    <>
      <FaPlay /> Start Quiz
    </>
  ) : (
    <>
      <FaLock /> No Quiz Available
    </>
  )}
</button>

                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StdSubject;
