import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import "../../index.css";
import "../../student.css";

function StdHome() {
  const navbarRef = useRef(null);
  const navigate = useNavigate();
  const [navbarHeight, setNavbarHeight] = useState(85);
  const [openInfo, setOpenInfo] = useState(null); // quiz | subject | profile

  useEffect(() => {
    if (navbarRef.current) {
      setNavbarHeight(navbarRef.current.offsetHeight);
    }
  }, []);

  const toggleInfo = (key) => {
    setOpenInfo((prev) => (prev === key ? null : key));
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      {/* NAVBAR */}
      <header ref={navbarRef} className="fixed top-0 left-0 w-full z-50">
        <StudentNavbar />
      </header>

      {/* MAIN */}
      <main
        className="flex-1 flex justify-center px-6"
        style={{ paddingTop: navbarHeight + 120 }}
      >
        {/* DASHBOARD CARD */}
        <div
  className="max-w-4xl w-full min-h-[70vh]
             bg-gradient-to-br
             from-indigo-200/80
             via-purple-200/70
             to-slate-200/80
             backdrop-blur-md
             p-12 rounded-2xl
             shadow-[0_30px_70px_rgba(0,0,0,0.6)]
             border border-indigo-200
             text-white
             flex flex-col justify-between"
>



          {/* TITLE */}
          <div>
            <h1 className="text-4xl font-extrabold text-center mb-4
                           bg-gradient-to-r from-indigo-700 to-purple-800
                           bg-clip-text text-transparent">
              Student Dashboard
            </h1>

            <p className="text-center text-gray-600 mb-10 text-lg">
              Access your learning materials, quizzes, and profile from here.
            </p>

            {/* MAIN ACTION BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
             {/* Subjects */}
<button
  onClick={() => navigate("/studentsubject")}
  className="py-8 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500
             text-white font-semibold text-lg shadow-md
             hover:scale-105 transition"
>
  📚 Subjects
  <p className="text-sm mt-1 opacity-90">
    Units & learning content
  </p>
</button>

{/* Quizzes */}
<button
  onClick={() => navigate("/studentquiz")}
  className="py-8 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500
             text-white font-semibold text-lg shadow-md
             hover:scale-105 transition"
>
  📝 Quizzes
  <p className="text-sm mt-1 opacity-90">
    Attempt & review quizzes
  </p>
</button>

{/* Profile */}
<button
  onClick={() => navigate("/studentprofile")}
  className="py-8 rounded-xl bg-gradient-to-r from-gray-700 to-gray-600
             text-white font-semibold text-lg shadow-md
             hover:scale-105 transition"
>
  👤 Profile
  <p className="text-sm mt-1 opacity-90">
    Account & security
  </p>
</button>

            </div>
          </div>

          {/* INFO SECTIONS */}
          <div className="space-y-5">

            {/* QUIZ INFO */}
            <div>
              <button
                onClick={() => toggleInfo("quiz")}
                className="w-full text-left font-semibold text-indigo-700"
              >
                📝 How quizzes work {openInfo === "quiz" ? "▲" : "▼"}
              </button>

              {openInfo === "quiz" && (
                <div className="mt-3 text-sm text-gray-700 bg-indigo-100 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Confirmation is required before starting</li>
                    <li>Timer starts immediately after confirmation</li>
                    <li>You can move between questions</li>
                    <li>🚩 Red flag questions for review</li>
                    <li>Skipped questions are counted separately</li>
                    <li>Results & correct answers shown after submission</li>
                    <li>Ranked quizzes affect leaderboard</li>
                  </ul>
                </div>
              )}
            </div>

            {/* SUBJECT INFO */}
            <div>
              <button
                onClick={() => toggleInfo("subject")}
                className="w-full text-left font-semibold text-indigo-700"
              >
                📚 Subject page information {openInfo === "subject" ? "▲" : "▼"}
              </button>

              {openInfo === "subject" && (
                <div className="mt-3 text-sm text-gray-700 bg-indigo-100 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Subjects are assigned based on your grade</li>
                    <li>Each subject contains multiple units</li>
                    <li>You can mark units as completed</li>
                    <li>Quizzes appear only if available for that unit</li>
                    <li>Progress is saved automatically</li>
                  </ul>
                </div>
              )}
            </div>

            {/* PROFILE INFO */}
            <div>
              <button
                onClick={() => toggleInfo("profile")}
                className="w-full text-left font-semibold text-indigo-700"
              >
                👤 Profile & student responsibilities {openInfo === "profile" ? "▲" : "▼"}
              </button>

              {openInfo === "profile" && (
                <div className="mt-3 text-sm text-gray-700 bg-indigo-100 p-4 rounded-lg">
                  <ul className="list-disc list-inside space-y-1">
                    <li>You can update your personal information</li>
                    <li>You can change your password</li>
                    <li>You cannot edit grades or quizzes</li>
                    <li>You cannot access admin features</li>
                    <li>Your activity is tracked for learning progress</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-8">
            Use the sections above to understand how each feature works.
          </p>
        </div>
      </main>
    </div>
  );
}

export default StdHome;
