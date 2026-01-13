// frontend/components/layouts/StudentNavbar.jsx
import React, { useRef, useState, useEffect, useContext } from "react";
import {
  FaChartLine,
  FaQuestionCircle,
  FaChevronDown,
  FaUserEdit,
  FaSignOutAlt,
  FaTrash,
  FaTachometerAlt,
  FaBook,
  FaBars,
  FaTimes,
  FaClipboardCheck,
  FaMedal,
} from "react-icons/fa";

import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL, API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import axios from "../../utils/axiosInstance";

const StudentNavbar = () => {
  const { user, setUser } = useContext(UserContext);

  const storedUser =
    user ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("user")) || {};
      } catch {
        return {};
      }
    })();

  const rawImg = storedUser?.profileImage || "";
  const fixedImg = rawImg && rawImg.startsWith("/uploads") ? BASE_URL + rawImg : rawImg;

  const [profileImage, setProfileImage] = useState(fixedImg);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  useEffect(() => {
    if (!storedUser) return;
    const img = storedUser?.profileImage || "";
    const fullImg = img && img.startsWith("/uploads") ? BASE_URL + img : img;
    setProfileImage(fullImg);
  }, [storedUser]);

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/studentdashboard" },
    { label: "Progress", icon: <FaChartLine />, path: "/studentprogress" },
    { label: "Subjects", icon: <FaBook />, path: "/studentsubject" },
    { label: "Quizzes", icon: <FaQuestionCircle />, path: "/studentquiz" },
    /*{ label: "Results", icon: <FaClipboardCheck />, path: "/studentgrades" },*/
    { label: "Profile", icon: <FaUserEdit />, path: "/studentprofile" },
  ];

  const getInitial = (name) => (name && name.length > 0 ? name[0].toUpperCase() : "U");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setUser(null);
    navigate("/login", { replace: true });
  };

  // Confirm remove picture -> call backend and update context + localStorage
  const confirmRemovePicture = async () => {
    try {
      const res = await axios.delete(API_PATHS.STUDENT.REMOVE_IMAGE);
      if (res.data.success) {
        const updated = res.data.user;
        // make frontend-friendly image path (server stores /uploads/...)
        const frontendUser = {
          ...updated,
          profileImage: updated.profileImage && updated.profileImage.startsWith("/uploads")
            ? BASE_URL + updated.profileImage
            : updated.profileImage || "",
        };

        // persist and update context
        localStorage.setItem("user", JSON.stringify(frontendUser));
        setUser(frontendUser);
        setProfileImage(frontendUser.profileImage || "");

        setShowConfirmDelete(false);
        setDropdownOpen(false);
      }
    } catch (err) {
      console.error("Remove picture failed:", err);
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200 shadow-lg px-6 sm:px-8 py-4 flex justify-between items-center border-b border-indigo-200">

        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Easy Quiz
        </h1>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center gap-6 ml-auto">

          <div className="flex gap-3 items-center">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "hover:bg-indigo-100 text-indigo-800"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* SUMMARY CARDS */}
          <div className="flex gap-3 items-center ml-4">
            <div className="bg-white/70 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaChartLine className="text-green-700 text-lg" />
              <div>
                <p className="text-xs text-green-900 opacity-80">Progress</p>
                <p className="font-semibold text-sm text-green-900">100%</p>
              </div>
            </div>

            <div className="bg-white/70 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaQuestionCircle className="text-indigo-700 text-lg" />
              <div>
                <p className="text-xs text-indigo-900 opacity-80">Quizzes</p>
                <p className="font-semibold text-sm text-indigo-900">2</p>
              </div>
            </div>

            <div className="bg-white/70 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:shadow-md transition backdrop-blur-sm">
              <FaMedal className="text-yellow-600 text-lg" />
              <div>
                <p className="text-xs text-yellow-900 opacity-80">Rank</p>
                <p className="font-semibold text-sm text-yellow-900">#1</p>
              </div>
            </div>
          </div>

          {/* PROFILE DROPDOWN */}
          <div className="relative ml-4" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  className="w-11 h-11 rounded-full border-2 border-indigo-400 shadow object-cover"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border-2 border-indigo-400 bg-indigo-500 text-white flex items-center justify-center font-bold">
                  {getInitial(storedUser?.name)}
                </div>
              )}

              <FaChevronDown className={`transition ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border py-2">
                <button
                  onClick={() => navigate("/studentprofile")}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaUserEdit /> Update Profile
                </button>

                <button
                  onClick={() => {
                    setShowConfirmDelete(true);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaTrash className="text-red-600" /> Remove Picture
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-indigo-700 p-2 rounded-full hover:bg-indigo-100"
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        )}
      </nav>

      {/* CONFIRM DELETE MODAL */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center border">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Remove Profile Picture?</h2>
            <p className="text-gray-700 mb-6">Are you sure you want to remove your picture?</p>

            <div className="flex justify-center gap-4">
              <button onClick={confirmRemovePicture} className="px-5 py-2 bg-red-600 text-white rounded-xl">
                Yes
              </button>

              <button onClick={() => setShowConfirmDelete(false)} className="px-5 py-2 bg-gray-200 rounded-xl">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentNavbar;
