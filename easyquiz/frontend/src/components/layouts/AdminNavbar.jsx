import React, { useState, useEffect, useRef, useContext } from "react";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaBook,
  FaQuestionCircle,
  FaUserCircle,
  FaChevronDown,
  FaUserEdit,
  FaSignOutAlt,
  FaUsers,
  FaTrash,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../../utils/apiPaths";
import axios from "../../utils/axiosInstance";
import { UserContext } from "../../context/userContext";

const AdminNavbar = () => {
  const { user, setUser } = useContext(UserContext);

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  const [profileImage, setProfileImage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  /* ---------------- LOAD PROFILE IMAGE ---------------- */
  useEffect(() => {
    if (!user) return;
    let img = user.profileImage;
    if (img?.startsWith("/uploads")) img = BASE_URL + img;
    setProfileImage(img || "");
  }, [user]);

  const getInitial = (name) =>
    name && name.length > 0 ? name[0].toUpperCase() : "A";

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false); // ✅ close mobile menu on navigation
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/login", { replace: true });
  };

  /* ---------------- REMOVE PROFILE IMAGE ---------------- */
  const confirmRemovePicture = async () => {
    try {
      const res = await axios.delete("/api/adm/profile/remove-image");
      if (res.data.success) {
        const updated = { ...user, profileImage: "" };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
        setProfileImage("");
      }
      setShowConfirmDelete(false);
      setDropdownOpen(false);
    } catch (err) {
      console.error("Remove image failed:", err);
    }
  };

  /* ---------------- RESPONSIVE + OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);

    const clickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admindashboard" },
    { label: "Grades", icon: <FaClipboardList />, path: "/admingrades" },
    { label: "Subjects", icon: <FaBook />, path: "/adminsubjects" },
    { label: "Quizzes", icon: <FaQuestionCircle />, path: "/adminquiz" },
    { label: "Profile", icon: <FaUserCircle />, path: "/adminprofile" },
  ];

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="w-full fixed top-0 left-0 z-50 bg-gradient-to-r from-indigo-200 via-blue-200 to-purple-200 shadow-lg px-6 sm:px-8 py-4 flex justify-between items-center border-b border-indigo-200">

        <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
          Easy Quiz
        </h1>

        {/* ================= DESKTOP MENU ================= */}
        <div className="hidden lg:flex items-center gap-6 ml-auto">

          {/* MAIN MENU */}
          <div className="flex gap-3 items-center">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-white/70 text-indigo-800 hover:bg-indigo-100"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* SUMMARY CARDS */}
          <div className="flex gap-3 ml-4">
            <div className="bg-white/80 px-3 py-2 rounded-xl flex items-center gap-2 shadow">
              <FaUsers className="text-blue-700" />
              <div>
                <p className="text-xs opacity-60">Users</p>
                <p className="font-semibold">5</p>
              </div>
            </div>

            <div className="bg-white/80 px-3 py-2 rounded-xl flex items-center gap-2 shadow">
              <FaBook className="text-yellow-700" />
              <div>
                <p className="text-xs opacity-60">Subjects</p>
                <p className="font-semibold">8</p>
              </div>
            </div>

            <div className="bg-white/80 px-3 py-2 rounded-xl flex items-center gap-2 shadow">
              <FaQuestionCircle className="text-pink-700" />
              <div>
                <p className="text-xs opacity-60">Quizzes</p>
                <p className="font-semibold">3</p>
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
                  className="w-11 h-11 rounded-full border-2 border-indigo-400 object-cover shadow"
                />
              ) : (
                <div className="w-11 h-11 rounded-full border-2 border-indigo-400 bg-indigo-600 text-white flex items-center justify-center font-bold shadow">
                  {getInitial(user?.name)}
                </div>
              )}
              <FaChevronDown className={`transition ${dropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border py-2">
                <button
                  onClick={() => navigate("/adminprofile")}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaUserEdit className="text-indigo-600" />
                  Update Profile
                </button>

                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-indigo-50 w-full text-left"
                >
                  <FaTrash className="text-red-600" />
                  Remove Picture
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600 font-medium"
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE BUTTON ================= */}
        {isMobile && (
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-indigo-800 rounded-full hover:bg-indigo-100 lg:hidden"
          >
            {isMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
          </button>
        )}
      </nav>

      {/* ================= MOBILE / TABLET MENU ================= */}
      {isMobile && (
        <div
          className={`fixed top-[88px] left-0 right-0 z-40 lg:hidden
            transition-all duration-300
            ${isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}
            backdrop-blur-xl bg-white/90 border-t shadow-xl`}
        >
          <div className="flex flex-col gap-3 p-5">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${
                  location.pathname === item.path
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                    : "bg-white text-indigo-800"
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ================= REMOVE IMAGE CONFIRM ================= */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Remove Profile Picture?
            </h2>
            <p className="text-gray-700 mb-6">This action cannot be undone.</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={confirmRemovePicture}
                className="px-5 py-2 bg-red-600 text-white rounded-xl">
                Yes
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-5 py-2 bg-gray-200 rounded-xl">
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminNavbar;
