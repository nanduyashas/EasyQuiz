import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";


import Login from "./pages/Auth/Login";

import Signup from "./pages/Auth/Signup";

import AdmHome from "./pages/AdminDashboard/AdmHome";
import StdHome from "./pages/StudentDashboard/StdHome";

import AdmGrades from "./pages/AdminDashboard/AdmGrades";
import AdmSubject from "./pages/AdminDashboard/AdmSubject";
import AdmQuiz from "./pages/AdminDashboard/AdmQuiz";
import AdminProfile from "./pages/AdminDashboard/AdminProfile";

import StdProgress from "./pages/StudentDashboard/StdProgress";
import StdGrade from "./pages/StudentDashboard/StdGrade";
import StdSubject from "./pages/StudentDashboard/StdSubject";
import StdQuiz from "./pages/StudentDashboard/StdQuiz";
import StudentProfile from "./pages/StudentDashboard/StudentProfile";

// Root Component - decides initial redirect based on role
const Root = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // 'admin' or 'student'

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admindashboard" replace />;
  }

  return <Navigate to="/studentdashboard" replace />;
};

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          {/* Root Route - redirects based on login & role */}
          <Route path="/" element={<Root />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          

          {/* Admin Dashboard Routes */}
          <Route path="/admindashboard" element={<AdmHome />} />
          <Route path="admingrades" element={<AdmGrades />} />
          <Route path="adminsubjects" element={<AdmSubject />} />
          <Route path="adminquiz" element={<AdmQuiz />} />
          <Route path="/adminprofile" element={<AdminProfile />} />


          {/* Student Dashboard Routes */}
          <Route path="/studentdashboard" element={<StdHome />} />
          <Route path="studentprogress" element={<StdProgress />} />
          <Route path="studentgrades" element={<StdGrade />} />
          <Route path="studentsubject" element={<StdSubject />} />
          <Route path="studentquiz" element={<StdQuiz />} />
          <Route path="/studentprofile" element={<StudentProfile />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
