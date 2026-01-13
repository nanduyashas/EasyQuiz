import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../components/layouts/AuthLayout";
import { BASE_URL, API_PATHS } from "../../utils/apiPaths";
import { validateEmail } from "../../utils/helper";
import {
  FaCamera,
  FaEye,
  FaEyeSlash,
  FaUserShield,
  FaUserGraduate,
} from "react-icons/fa";

const Signup = () => {
  const [activeTab, setActiveTab] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
    adminKey: "",
    profileImage: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateEmail(formData.email))
      return setError("Enter a valid email.");
    if (formData.password.length < 6)
      return setError("Password must be at least 6 characters.");
    if (formData.password !== formData.confirmPassword)
      return setError("Passwords do not match.");

    if (activeTab === "admin" && !formData.adminKey)
      return setError("Admin security key required!");

    // ⭐ Grade validation
    if (activeTab === "student") {
      if (!formData.grade)
        return setError("Please select your grade.");

      const validGrades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
      if (!validGrades.includes(formData.grade))
        return setError("Invalid grade selected.");
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);

      if (activeTab === "student") {
        data.append("grade", formData.grade);
      }

      if (formData.profileImage) {
        data.append("profileImage", formData.profileImage);
      }

      let apiPath = API_PATHS.AUTH.REGISTER;

      if (activeTab === "admin") {
        data.append("adminKey", formData.adminKey);
        apiPath = API_PATHS.AUTH.ADMIN_REGISTER;
      }

      const res = await axios.post(`${BASE_URL}${apiPath}`, data);

      if (!res.data.success) {
        return setError("Signup failed.");
      }

      const loginRes = await axios.post(`${BASE_URL}${API_PATHS.AUTH.LOGIN}`, {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = loginRes.data;

      if (!token || !user) return setError("Login failed.");

      let finalImage = user.profileImage;
      if (finalImage?.startsWith("/uploads")) {
        finalImage = BASE_URL + finalImage;
      }

      const updatedUser = {
        ...user,
        profileImage: finalImage,
      };

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("role", user.role);

      window.dispatchEvent(new Event("user-updated"));

      navigate(user.role === "admin" ? "/admindashboard" : "/studentdashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="w-full sm:w-[700px] bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-100 p-10 mx-auto flex flex-col transition-all duration-500">

        <h2 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Create Your Account
        </h2>

        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => setActiveTab("student")}
            className={`px-6 py-2 rounded-xl border ${
              activeTab === "student"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } flex items-center gap-2 font-semibold`}
          >
            <FaUserGraduate /> Student
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`px-6 py-2 rounded-xl border ${
              activeTab === "admin"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            } flex items-center gap-2 font-semibold`}
          >
            <FaUserShield /> Admin
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">

          {/* IMAGE */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-indigo-200 shadow-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>

              <label
                htmlFor="profileImage"
                className="absolute bottom-1 right-1 bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full cursor-pointer shadow-lg hover:scale-110 transition"
              >
                <FaCamera className="text-white text-sm" />
              </label>

              <input
                id="profileImage"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* NAME */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="text"
              name="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="relative">
            <label className="text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
            />
          </div>

          {/* ⭐ STUDENT GRADE FIELD (Dropdown + Validation) */}
          {activeTab === "student" && (
            <div>
              <label className="text-sm font-medium text-gray-700">Grade</label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400 text-sm"
              >
                <option value="">-- Select Grade --</option>

                {/* Grades 6 - 11 */}
                {[6, 7, 8, 9, 10, 11].map((g) => (
                  <option key={g} value={`Grade ${g}`}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* ADMIN KEY */}
          {activeTab === "admin" && (
            <div className="relative">
              <label className="text-sm font-medium text-gray-700">
                Admin Security Key
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="adminKey"
                placeholder="Enter Admin Secret Code"
                value={formData.adminKey}
                onChange={handleChange}
                className="w-full px-4 py-2 pr-12 border rounded-lg focus:ring-2 focus:ring-purple-400 text-sm"
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-center text-sm">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 transition"
          >
            SIGN UP
          </button>
        </form>

        <p className="text-sm text-gray-700 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Signup;