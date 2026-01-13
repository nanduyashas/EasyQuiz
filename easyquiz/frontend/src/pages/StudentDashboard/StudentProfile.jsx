import React, { useState, useEffect, useRef } from "react";
import {
  FaCamera,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaTrash,
} from "react-icons/fa";

import StudentNavbar from "../../components/layouts/StudentNavbar";
import axios from "../../utils/axiosInstance";
import { API_PATHS, BASE_URL } from "../../utils/apiPaths";
import "../../index.css";
import "../../student.css";

const StudentProfile = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "Student",
    email: "student@easyquiz.com",
    grade: "",
    role: "student",
    profileImage: "",
  };

  const [tempImage, setTempImage] = useState(
    user.profileImage?.startsWith("/uploads")
      ? BASE_URL + user.profileImage
      : user.profileImage
  );

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [message, setMessage] = useState("");
  const [passMessage, setPassMessage] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Navbar height
  const [navbarHeight, setNavbarHeight] = useState(85);
  const navbarRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const update = () => {
      if (navbarRef.current) setNavbarHeight(navbarRef.current.offsetHeight);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getInitial = (name) =>
    name?.length > 0 ? name[0].toUpperCase() : "U";

  // ---------------------------
  // IMAGE CHANGE
  // ---------------------------
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setTempImage(localPreview);

    const formData = new FormData();
    formData.append("profileImage", file);

    try {
      const res = await axios.put(API_PATHS.STUDENT.UPDATE_IMAGE, formData);
      if (res.data.success) {
        const newImg = BASE_URL + res.data.profileImage;
        const updated = { ...user, profileImage: newImg };
        localStorage.setItem("user", JSON.stringify(updated));
        window.dispatchEvent(new Event("user-updated"));
        setMessage("✅ Profile image updated!");
      }
    } catch (err) {
      setMessage("❌ Image update failed");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  // ---------------------------
  // SAVE PROFILE (NAME ONLY)
  // ---------------------------
  const handleSaveProfile = async () => {
    try {
      const newName = document.getElementById("nameField").value;

      const res = await axios.put(API_PATHS.STUDENT.UPDATE, {
        name: newName,
      });

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.dispatchEvent(new Event("user-updated"));
        setMessage("✅ Profile updated successfully!");
      }
    } catch (err) {
      setMessage("❌ Update failed");
    }

    setTimeout(() => setMessage(""), 3000);
  };

  // ---------------------------
  // CHANGE PASSWORD
  // ---------------------------
  const handleChangePassword = async () => {
    const { current, new: newPass, confirm } = passwords;

    if (!current || !newPass || !confirm) {
      setPassMessage("⚠ Please fill all fields");
      return;
    }

    if (newPass !== confirm) {
      setPassMessage("❌ Passwords do not match");
      return;
    }

    try {
      const res = await axios.put(API_PATHS.STUDENT.CHANGE_PASSWORD, {
        currentPassword: current,
        newPassword: newPass,
      });

      if (res.data.success) {
        setPassMessage("✅ Password changed!");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        setPassMessage("❌ Failed to update password");
      }
    } catch {
      setPassMessage("❌ Error updating password");
    }

    setTimeout(() => setPassMessage(""), 3000);
  };

  // ---------------------------
  // DELETE ACCOUNT
  // ---------------------------
  const confirmDelete = async () => {
    try {
      const res = await axios.delete(API_PATHS.STUDENT.DELETE_ACCOUNT);

      if (res.data.success) {
        localStorage.clear();
        window.location.href = "/login";
      }
    } catch {
      alert("Error deleting account");
    }
  };

  return (
    <div className="min-h-screen flex flex-col app-background">
      <header ref={navbarRef} className="w-full fixed top-0 left-0 z-50">
        <StudentNavbar />
      </header>

      <main
        className="p-6 md:p-12 transition-all"
        style={{ marginTop: `${navbarHeight + 120}px` }}
      >
        <div className="max-w-5xl mx-auto space-y-10">

          {/* HEADER */}
          <div className="text-center animate-fadeIn">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r 
              from-indigo-700 to-purple-800 bg-clip-text text-transparent">
               Profile Settings
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your personal information and security settings.
            </p>
          </div>

          {/* PROFILE CARD */}
          <div className="admin-card p-8 md:p-10 animate-fadeInExpand">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
              Profile Information
            </h2>

            {message && (
              <div className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 font-medium">
                {message}
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center gap-10">
              
              {/* IMAGE */}
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-300 shadow-xl">
                {tempImage ? (
                  <img src={tempImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-purple-600
                  text-white flex items-center justify-center text-5xl font-bold">
                    {getInitial(user.name)}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current.click()}
                  className="absolute bottom-2 right-2 bg-indigo-600 p-3 text-white rounded-full shadow-lg hover:scale-105 transition"
                >
                  <FaCamera />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* FIELDS */}
              <div className="flex-1 space-y-5 w-full">
                <div>
                  <label className="font-medium text-sm">Full Name</label>
                  <input
                    id="nameField"
                    className="w-full p-3 rounded-xl border bg-white/70"
                    defaultValue={user.name}
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">Email</label>
                  <input
                    className="w-full p-3 rounded-xl border bg-white/70"
                    defaultValue={user.email}
                    readOnly
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">Grade</label>
                  <input
                    id="gradeField"
                    className="w-full p-3 rounded-xl border bg-white/70"
                    defaultValue={user.grade}
                    readOnly // ⭐ STUDENT CANNOT CHANGE GRADE
                  />
                </div>

                <button onClick={handleSaveProfile} className="btn-gradient mt-4">
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* PASSWORD CARD */}
          <div className="admin-card p-8 md:p-10 animate-fadeInExpand">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-6 flex items-center gap-2">
              <FaLock className="text-indigo-600" /> Change Password
            </h2>

            {passMessage && (
              <div className="p-3 mb-4 rounded-lg bg-indigo-100 text-indigo-700 font-medium">
                {passMessage}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <PasswordField
                label="Current Password"
                value={passwords.current}
                onChange={(v) => setPasswords({ ...passwords, current: v })}
                show={showPass.current}
                toggle={() =>
                  setShowPass({ ...showPass, current: !showPass.current })
                }
              />

              <PasswordField
                label="New Password"
                value={passwords.new}
                onChange={(v) => setPasswords({ ...passwords, new: v })}
                show={showPass.new}
                toggle={() =>
                  setShowPass({ ...showPass, new: !showPass.new })
                }
              />

              <PasswordField
                label="Confirm Password"
                value={passwords.confirm}
                onChange={(v) => setPasswords({ ...passwords, confirm: v })}
                show={showPass.confirm}
                toggle={() =>
                  setShowPass({ ...showPass, confirm: !showPass.confirm })
                }
              />
            </div>

            <button onClick={handleChangePassword} className="btn-gradient mt-6">
              Update Password
            </button>
          </div>

          {/* DELETE SECTION */}
          <div className="admin-card p-8 md:p-10 text-center animate-fadeInExpand">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Danger Zone
            </h2>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger px-6 py-2"
            >
              <FaTrash className="inline mr-2" />
              Delete My Account
            </button>
          </div>

          {/* ABOUT STUDENT ROLE */}
          <div className="admin-card p-8 md:p-10 animate-fadeInExpand">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              About Student Role
            </h2>
            <p className="text-gray-700 leading-relaxed">
              As a student in EasyQuiz, you can explore quizzes by grade and subject, 
              track your learning progress, review your results, and improve your skills 
              through continuous practice.
            </p>
            <p className="text-gray-700 leading-relaxed mt-2">
              Students can participate in quizzes, check performance analytics, 
              view strengths and weaknesses, and maintain a personalised learning journey. 
              The more you practice, the higher you rank on the leaderboard!
            </p>
          </div>
        </div>
      </main>

      {/* DELETE POPUP */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete Your Account?
            </h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-center gap-4">
              <button onClick={confirmDelete} className="btn-danger px-6 py-2">
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-2 bg-gray-200 rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PasswordField = ({ label, value, onChange, show, toggle }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      placeholder={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 rounded-xl border bg-white/70 pr-12"
    />
    <span
      onClick={toggle}
      className="absolute right-4 top-3 cursor-pointer text-indigo-600"
    >
      {show ? <FaEyeSlash /> : <FaEye />}
    </span>
  </div>
);

export default StudentProfile;
