import React, { useRef, useState, useEffect } from "react";
import StudentNavbar from "../../components/layouts/StudentNavbar";
import QuestionPalette from "../../components/student/quiz/QuestionPalette";
import ResultSummary from "../../components/student/quiz/ResultSummary";
import AnswerReview from "../../components/student/quiz/AnswerReview";
import ConfirmModal from "../../components/ConfirmationModal";
import Toast from "../../components/Toast";
import Leaderboard from "../../components/student/quiz/Leaderboard";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";


import "../../index.css";
import "../../student.css";


function StdQuiz() {
  /* ---------------- NAVBAR HEIGHT ---------------- */
  const navbarRef = useRef(null);
  const [navbarHeight, setNavbarHeight] = useState(85);

  useEffect(() => {
    const updateHeight = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  /* ---------------- STEP 1 ---------------- */
  const [subjects, setSubjects] = useState([]);
const [selectedSubject, setSelectedSubject] = useState(null);

  const [quizFilter, setQuizFilter] = useState("all");

  /* ---------------- STEP 2 ---------------- */
  const [showQuizInfo, setShowQuizInfo] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);

  /* ---------------- STEP 3 ---------------- */
  const [startQuiz, setStartQuiz] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flags, setFlags] = useState({});
  const [timeLeft, setTimeLeft] = useState(60 * 30);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const goPrev = () => {
  if (currentIndex > 0) setCurrentIndex((i) => i - 1);
};

const goNext = () => {
  if (!demoQuiz || !demoQuiz.questions) return;
  if (currentIndex < demoQuiz.questions.length - 1) {
    setCurrentIndex((i) => i + 1);
  }
};




  /* ---------------- STEP 4 + 5 ---------------- */
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  /* ---------------- STEP 7 ---------------- */
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [toasts, setToasts] = useState([]);

  /* ---------------- QUIZ LIST ---------------- */
const [quizList, setQuizList] = useState([]);
useEffect(() => {
  const loadQuizzes = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.STD_QUIZ.LIST);
      if (res.data.success) {
        setQuizList(res.data.quizzes);
      }
    } catch {
      addToast("Failed to load quizzes", "error");
    }
  };

  loadQuizzes();
}, []);

 

 const filteredQuizzes = (quizList || [])
  .filter(q => {
    if (!selectedSubject) return true;
    return q.subjectId === selectedSubject._id;
  })
  .filter(q => {
    if (quizFilter === "all") return true;
    return quizFilter === "ranked"
      ? q.affectsRank === true
      : q.affectsRank === false;
  });




  /* ---------------- DEMO QUIZ ---------------- */
  const [demoQuiz, setDemoQuiz] = useState(null);


  useEffect(() => {
  const loadSubjects = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.STD_QUIZ.SUBJECTS);
      if (res.data.success && res.data.subjects.length > 0) {
  setSubjects(res.data.subjects);
  setSelectedSubject(res.data.subjects[0]);
}

    } catch {
      addToast("Failed to load subjects", "error");
    }
  };
  loadSubjects();
}, []);

console.log("Selected subject:", selectedSubject);
console.log("SUBJECT ID:", selectedSubject?._id);
console.log("QUIZ COUNT:", quizList.length);


  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (!startQuiz) return;
    if (timeLeft <= 0) handleSubmit();
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [startQuiz, timeLeft]);

  const currentQuestion =
  demoQuiz && demoQuiz.questions
    ? demoQuiz.questions[currentIndex]
    : null;

  /* ---------------- HELPERS ---------------- */
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  };

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  /* ---------------- SUBMIT ---------------- */
 const handleSubmit = async () => {
  try {
    const payload = {
  quizId: demoQuiz.id || demoQuiz._id,
  answers: Object.entries(answers).map(([qid, selected]) => ({
    questionId: qid,
    selected,
  })),
};


    const res = await axiosInstance.post(
      API_PATHS.STD_QUIZ.SUBMIT,
      payload
    );

  if (res.data.success) {
  setResult({
    correct: res.data.result.correct,
    wrong: res.data.result.wrong,
    skipped: res.data.result.skipped,
    accuracy: res.data.result.accuracy,
    correctAnswers: res.data.result.correctAnswers,
  });

  setShowResult(true);
  setStartQuiz(false);
  addToast("Quiz submitted successfully", "success");
}


  } catch {
    addToast("Failed to submit quiz", "error");
  }
};


 const getResultUI = () => {
  if (!result) return {};
  if (result.accuracy >= 90) return { emoji: "🏆🎉", text: "Outstanding!" };
  if (result.accuracy >= 75) return { emoji: "😄✨", text: "Great Job!" };
  if (result.accuracy >= 50) return { emoji: "🙂👍", text: "Good Effort" };
  return { emoji: "😕", text: "Try Again" };
};


  const ui = getResultUI();

  /* ---------------- RENDER ---------------- */
  return (
    <div className="min-h-screen app-background">
      <header ref={navbarRef} className="fixed top-0 left-0 w-full z-50">
        <StudentNavbar />
      </header>


      <main style={{ paddingTop: navbarHeight + 140 }} className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">

          {/* STEP 1 */}
          {!startQuiz && !showResult && (
            <>
            <div className="text-center animate-fadeIn">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r 
              from-indigo-700 to-purple-800 bg-clip-text text-transparent">
              My Quizzes
            </h1>
            </div>

              <div className="flex gap-3 mb-6">
                {subjects.map((s) => (
                  <div
                    key={s._id}
                   onClick={() => {
  setSelectedSubject(s);
  setQuizList([]); // reset old quizzes
}}

                   className={`subject-card cursor-pointer ${
  selectedSubject && selectedSubject._id === s._id ? "selected-grade" : ""
}`}

                  >
                    <h3>{s.name}</h3>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mb-6">
                {["all", "ranked", "practice"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setQuizFilter(f)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      quizFilter === f
                        ? "bg-indigo-600 text-white"
                        : "bg-white shadow"
                    }`}
                  >
                    {f === "all"
                      ? "All Quizzes"
                      : f === "ranked"
                      ? "Ranked Quizzes"
                      : "Practice Quizzes"}
                  </button>
                ))}
              </div>

              {filteredQuizzes.length === 0 && (
  <p className="text-center text-gray-500 mt-6">
    No quizzes available for this subject.
  </p>
)}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredQuizzes.map((quiz) => (
                  <div key={quiz.id} className="panel">
  {/* ✅ QUIZ TITLE */}
  <h3 className="font-bold text-lg">
    {quiz.title || "Untitled Quiz"}
  </h3>

  {/* ✅ SUBJECT */}
  <p className="text-sm text-gray-500">
    Subject: {quiz.subject || "General"}
  </p>

  {/* ✅ TYPE */}
  <p className="text-xs text-gray-400 capitalize">
    {quiz.affectsRank ? "Ranked Quiz" : "Practice Quiz"}
  </p>

  <button
    className="btn-gradient mt-4"
    onClick={async () => {
      try {
        const res = await axiosInstance.get(
          API_PATHS.STD_QUIZ.GET_ONE(quiz.id)
        );
        if (res.data.success) {
          setDemoQuiz(res.data.quiz);
          setSelectedQuiz(quiz);
          setConfirmStart(true);
        }
      } catch {
        addToast("Failed to load quiz", "error");
      }
    }}
  >
    Start Quiz
  </button>
</div>

                ))}
              </div>
            </>
          )}

          {/* STEP 2 */}
          {showQuizInfo && (
            <ConfirmModal
              open
              title="Quiz Info"
              message="Ready to start the quiz?"
              onCancel={() => setShowQuizInfo(false)}
              onConfirm={() => {
                setShowQuizInfo(false);
                setConfirmStart(true);
              }}
            />
          )}

          {confirmStart && (
            <ConfirmModal
              open
              title="Confirm Start"
              message="Timer will start immediately."
              onCancel={() => setConfirmStart(false)}
              onConfirm={() => {
                setConfirmStart(false);
                setStartQuiz(true);
              }}
            />
          )}

          {confirmStart && selectedQuiz && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
    <div className="panel max-w-md w-full animate-fadeInExpand">

      <h3 className="text-lg font-bold text-purple-700 mb-2">
        Confirm Start
      </h3>

      <p className="text-sm text-gray-600 mb-3">
        The timer will start immediately after confirmation.
        You cannot pause the quiz once started.
      </p>

      {/* ⚠ RANKED WARNING */}
      {selectedQuiz.type === "ranked" && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-300">
          <p className="text-sm text-red-700 font-semibold">
            ⚠ Ranked Quiz Warning
          </p>
          <ul className="text-xs text-red-600 mt-1 list-disc list-inside">
            <li>You can attempt this quiz only once</li>
            <li>Your score will affect the leaderboard</li>
            <li>You cannot reattempt after submission</li>
          </ul>
        </div>
      )}

      {/* ✅ CHECKBOX */}
      <label className="flex items-center gap-2 mb-6 text-sm">
        <input
          type="checkbox"
          checked={agreeChecked}
          onChange={(e) => setAgreeChecked(e.target.checked)}
        />
        I understand and want to start the quiz
      </label>

      <div className="flex justify-end gap-4">
        <button
          className="bg-white shadow-soft px-4 py-2 rounded-lg"
          onClick={() => {
            setConfirmStart(false);
            setAgreeChecked(false);
            setSelectedQuiz(null);
          }}
        >
          Cancel
        </button>

        <button
          disabled={!agreeChecked}
          className={`px-4 py-2 rounded-lg text-white ${
            agreeChecked
              ? "bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={() => {
            setConfirmStart(false);
            setAgreeChecked(false);
            setStartQuiz(true);
          }}
        >
          Confirm & Start
        </button>
      </div>

    </div>
  </div>
)}


          {/* STEP 3 */}
          {startQuiz && demoQuiz && (

            <div className="panel">
              <div className="flex justify-between mb-4">
                <h2 className="font-bold">{demoQuiz.title}</h2>
                <span className="text-red-600">⏱ {formatTime(timeLeft)}</span>
              </div>

              <p className="mb-4">{currentQuestion.text}</p>

              

              {["a", "b", "c", "d"].map((key, i) => (
  <button
    key={key}
    onClick={() =>
      setAnswers({
        ...answers,
        [currentQuestion.id]: key,
      })
    }
    className={`block w-full p-3 mt-2 border rounded-lg ${
      answers[currentQuestion.id] === key
        ? "bg-indigo-50 border-indigo-500"
        : ""
    }`}
  >
    {String.fromCharCode(65 + i)}. {currentQuestion[key]}
  </button>
))}

{/* PREVIOUS / NEXT NAVIGATION */}
<div className="flex justify-between items-center mt-6">

  {/* PREVIOUS */}
  <button
    disabled={currentIndex === 0}
    onClick={() => setCurrentIndex((i) => i - 1)}
    className={`px-6 py-2 rounded-lg font-semibold transition ${
      currentIndex === 0
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-white shadow-soft hover:bg-gray-50"
    }`}
  >
    ⬅ Previous
  </button>

  {/* NEXT */}
  <button
    disabled={currentIndex === demoQuiz.questions.length - 1}
    onClick={() => setCurrentIndex((i) => i + 1)}
    className={`px-6 py-2 rounded-lg font-semibold transition ${
      currentIndex === demoQuiz.questions.length - 1
        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
        : "bg-indigo-600 text-white hover:bg-indigo-700"
    }`}
  >
    Next ➡
  </button>

</div>

              {/* 🔴 RED FLAG */}
              <button
                className={`mt-4 px-4 py-2 rounded-lg font-semibold ${
                  flags[currentQuestion.id]
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={() =>
                  setFlags((prev) => ({
                    ...prev,
                    [currentQuestion.id]: !prev[currentQuestion.id],
                  }))
                }
              >
                🚩 {flags[currentQuestion.id] ? "Unmark Review" : "Mark for Review"}
              </button>

              <QuestionPalette
                questions={demoQuiz.questions}
                currentIndex={currentIndex}
                answers={answers}
                flags={flags}
                onJump={setCurrentIndex}
              />

              

              <div className="text-right mt-6">
                <button
                  className="bg-red-600 text-white px-6 py-2 rounded-lg"
                  onClick={() => setShowSubmitConfirm(true)}
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* SUBMIT CONFIRM */}
          <ConfirmModal
            open={showSubmitConfirm}
            title="Submit Quiz"
            message="Are you sure?"
            onCancel={() => setShowSubmitConfirm(false)}
            onConfirm={handleSubmit}
          />

          {/* RESULT */}
          {showResult && result && (
            <div className="panel text-center">
              <div className="text-6xl">{ui.emoji}</div>
              <h2 className="text-3xl font-bold">{ui.text}</h2>

              <ResultSummary
                questions={demoQuiz.questions}
                answers={answers}
                result={result}
              />

             <AnswerReview
  questions={demoQuiz.questions}
  answers={answers}
  result={result}
/>



              {demoQuiz.affectsRank && (
                <button
                  className="btn-gradient mt-4"
                  onClick={() => setShowLeaderboard(true)}
                >
                  View Leaderboard
                </button>
              )}

              

              <button
                className="mt-6 bg-white shadow-soft px-6 py-2 rounded-lg"
                onClick={() => {
                  setShowResult(false);
                  setStartQuiz(false);
                  setAnswers({});
                  setFlags({});
                  setCurrentIndex(0);
                  setTimeLeft(60 * 30);
                }}
              >
                Back to Quiz Board
              </button>
            </div>
          )}

          {/* LEADERBOARD (ONLY ONCE) */}
          {showLeaderboard && (
            <Leaderboard
             quizId={demoQuiz._id || demoQuiz.id}
              onClose={() => setShowLeaderboard(false)}
            />
          )}

          <Toast toasts={toasts} onRemove={removeToast} />
        </div>
      </main>
    </div>
  );
}

export default StdQuiz;
