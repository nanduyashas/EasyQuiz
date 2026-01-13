import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaQuestion, FaClock, FaTrophy, FaUsers, FaPlay } from "react-icons/fa";
import logo from "../../assets/images/logo.png";

// -----------------------------------------------------------------------------
// Reusable Stats Card
// -----------------------------------------------------------------------------
const StatsCard = ({ icon, label, value, color = "bg-blue-500" }) => (
  <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-white/20 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <div
      className={`w-12 h-12 flex items-center justify-center text-lg text-white ${color} rounded-full shadow-md`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-600 font-medium">{label}</p>
      <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

// -----------------------------------------------------------------------------
// Sample Quiz Preview Card
// -----------------------------------------------------------------------------
const QuizPreviewCard = ({ title, questions, time, difficulty }) => {
  const difficultyColor =
    difficulty === "Easy"
      ? "bg-green-100 text-green-700"
      : difficulty === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-red-100 text-red-700";

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 group transform hover:-translate-y-1">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-md text-gray-800 group-hover:text-blue-600 transition">
          {title}
        </h4>
        <FaPlay className="text-blue-500 text-lg opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <FaQuestion /> {questions} Qs
        </span>
        <span className="flex items-center gap-1">
          <FaClock /> {time}
        </span>
      </div>
      <div className="mt-2">
        <span
          className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyColor}`}
        >
          {difficulty}
        </span>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// AuthLayout Component
// -----------------------------------------------------------------------------
const AuthLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleExploreClick = () => {
    if (location.pathname === "/login") {
      // Scroll to login form section
      const loginForm = document.getElementById("loginFormSection");
      if (loginForm) loginForm.scrollIntoView({ behavior: "smooth" });
    } else if (location.pathname === "/signup") {
      // Scroll to signup form section
      const signupForm = document.getElementById("signupFormSection");
      if (signupForm) signupForm.scrollIntoView({ behavior: "smooth" });
    } else {
      // Navigate to login if user is on another page
      navigate("/login");
      setTimeout(() => {
        const loginForm = document.getElementById("loginFormSection");
        if (loginForm) loginForm.scrollIntoView({ behavior: "smooth" });
      }, 400);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 relative overflow-hidden">
      {/* Background Decorative Shapes */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 via-purple-200 to-teal-200 opacity-50 blur-3xl animate-pulse"></div>
      <div className="absolute top-16 left-10 w-40 h-40 rounded-full bg-yellow-300 opacity-40 blur-3xl animate-spin-slow"></div>
      <div className="absolute bottom-16 right-16 w-48 h-48 rounded-full bg-pink-300 opacity-30 blur-2xl animate-bounce-slow"></div>
      <div className="absolute top-1/2 right-1/4 w-36 h-36 rounded-full bg-green-300 opacity-20 blur-3xl animate-pulse"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row w-full justify-center items-start">
        {/* LEFT SECTION */}
        <div className="w-full md:w-1/2 flex flex-col justify-start items-center md:items-start px-8 py-12 space-y-6">
          {/* Logo + Title */}
          <div className="flex items-center gap-6 w-full -mt-10">
            <img
              src={logo}
              alt="Easy Quiz Logo"
              className="w-64 h-64 drop-shadow-lg animate-float"
            />
            <h1 className="text-8xl md:text-8xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Easy Quiz
            </h1>
          </div>

          {/* Form Section */}
          <div className="w-full flex flex-col justify-center items-center mt-2">
            {children}
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-start px-8 py-12 space-y-6">
          {/* Stats Section */}
          <div className="flex flex-nowrap justify-center gap-3 mt-6 w-full overflow-x-auto">
            <StatsCard
              icon={<FaTrophy />}
              label="Total Quizzes"
              value="1,240"
              color="bg-gradient-to-r from-yellow-400 to-orange-500"
            />
            <StatsCard
              icon={<FaQuestion />}
              label="Questions Bank"
              value="8,500+"
              color="bg-gradient-to-r from-blue-500 to-indigo-600"
            />
            <StatsCard
              icon={<FaClock />}
              label="Avg. Time Taken"
              value="12 mins"
              color="bg-gradient-to-r from-purple-500 to-pink-600"
            />
            <StatsCard
              icon={<FaUsers />}
              label="Active Users"
              value="42.3K"
              color="bg-gradient-to-r from-teal-500 to-green-600"
            />
            <StatsCard
              icon={<FaPlay />}
              label="Completed Quizzes"
              value="980"
              color="bg-gradient-to-r from-pink-500 to-red-500"
            />
          </div>

          {/* Quiz Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <QuizPreviewCard
              title="Fun Math Challenge"
              questions={20}
              time="10 min"
              difficulty="Easy"
            />
            <QuizPreviewCard
              title="Science Explorers"
              questions={25}
              time="15 min"
              difficulty="Medium"
            />
            <QuizPreviewCard
              title="History Quest"
              questions={15}
              time="12 min"
              difficulty="Medium"
            />
            <QuizPreviewCard
              title="English Grammar Fun"
              questions={18}
              time="10 min"
              difficulty="Easy"
            />
            <QuizPreviewCard
              title="Commerce & Accounting"
              questions={22}
              time="14 min"
              difficulty="Medium"
            />
            <QuizPreviewCard
              title="Sinhala Language"
              questions={20}
              time="11 min"
              difficulty="Easy"
            />
            <QuizPreviewCard
              title="Music Theory & Rhythm"
              questions={16}
              time="9 min"
              difficulty="Easy"
            />
            <QuizPreviewCard
              title="Dancing & Drama Quiz"
              questions={18}
              time="13 min"
              difficulty="Medium"
            />
            <QuizPreviewCard
              title="Geography Adventure"
              questions={21}
              time="12 min"
              difficulty="Easy"
            />
            <QuizPreviewCard
              title="Information Technology"
              questions={23}
              time="15 min"
              difficulty="Medium"
            />
          </div>

          {/* ✅ Explore Button */}
          <div className="mt-2 text-center">
            <button
              onClick={handleExploreClick}
              className="mt-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition"
            >
              Explore Quizzes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
