import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../components/layouts/AuthLayout";
import { BASE_URL, API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const navigate = useNavigate();

  // -------------------------
  // STUDENT/ADMIN LOGIN
  // -------------------------
  const handleStudentLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(email)) return setError("Enter a valid email.");
    if (!password) return setError("Enter your password.");

    try {
      const res = await axios.post(`${BASE_URL}${API_PATHS.AUTH.LOGIN}`, {
        email,
        password,
      });

      const { token, user } = res.data;

      if (token) {
        // Save all data
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        // ⭐ FORCE USER CONTEXT UPDATE IMMEDIATELY
        window.dispatchEvent(new Event("user-updated"));

        // Redirect based on role
        if (user.role === "admin") navigate("/admindashboard");
        else navigate("/studentdashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-xl animate-fadeIn bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100 p-6 sm:p-10 mx-auto transition-all duration-500 relative">

        <h2 className="text-3xl sm:text-4xl font-bold text-center text-indigo-700 mb-4">
          Welcome Back
        </h2>

        <p className="text-gray-600 text-center mb-8">
          Please enter your credentials to log in
        </p>

        <form onSubmit={handleStudentLogin} className="space-y-5">

          <div>
            <label className="text-gray-700 font-medium text-sm">Email Address</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="relative">
            <label className="text-gray-700 font-medium text-sm">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[42px] text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="text-center text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition"
          >
            LOGIN
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-6 text-center">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-blue-600 font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {showAdminLogin && (
        <AdminLoginModal close={() => setShowAdminLogin(false)} />
      )}
    </AuthLayout>
  );
};

export default Login;


// ==========================================================
// ADMIN LOGIN POPUP
// ==========================================================
const AdminLoginModal = ({ close }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${BASE_URL}${API_PATHS.AUTH.LOGIN}`, {
        email,
        password,
      });

      const { token, user } = res.data;

      if (!token) return;

      // Save data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);

      // ⭐ IMPORTANT: FIX PROFILE NOT SHOWING IMMEDIATELY
      window.dispatchEvent(new Event("user-updated"));

      if (user.role === "admin") navigate("/admindashboard");
      else navigate("/studentdashboard");

      close();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid admin login.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white/95 w-[90%] max-w-xl rounded-3xl p-8 shadow-2xl border border-indigo-200 relative scale-95 animate-modalPop">

        <button
          onClick={close}
          className="absolute top-4 right-4 bg-red-100 hover:bg-red-300 transition p-2 rounded-full"
        >
          ✕
        </button>

        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-4">
          Admin Login
        </h2>

        <p className="text-gray-600 text-center mb-6">
          Enter admin credentials to continue
        </p>

        <form onSubmit={handleAdminLogin} className="space-y-5">

          <div>
            <label className="text-sm font-medium text-gray-700">Admin Email</label>
            <input
              type="text"
              value={email}
              placeholder="admin@example.com"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="********"
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg pr-12 focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:scale-105 transition"
          >
            LOGIN AS ADMIN
          </button>
        </form>
      </div>
    </div>
  );
};
