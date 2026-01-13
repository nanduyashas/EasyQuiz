import React, { useState, useEffect } from "react";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaBook,
  FaQuestionCircle,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png"; //  Make sure this file exists

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admindashboard" },
    { label: "Grades", icon: <FaClipboardList />, path: "/admingrades" },
    { label: "Subjects", icon: <FaBook />, path: "/adminsubjects" },
    { label: "Quizzes", icon: <FaQuestionCircle />, path: "/adminquiz" },
    { label: "Profile", icon: <FaUserCircle />, path: "/adminprofile" },
    { label: "Log Out", icon: <FaSignOutAlt />, path: "/login" },
  ];

  //  Toggle Sidebar
  const toggleSidebar = () => setIsOpen(!isOpen);

  //  Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMobile(true);
        setIsOpen(false); // hide sidebar on small screen by default
      } else {
        setIsMobile(false);
        setIsOpen(true); // always open on large screens
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //  Handle navigation
  const handleNavigation = (path) => {
    if (path === "/login") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate(path);
    if (isMobile) setIsOpen(false); // auto close on mobile
  };

  return (
    <>
      {/*  ☰ Menu Button - visible only on small screens and below navbar */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-[92px] left-4 z-40 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300 focus:outline-none"
        >
          <FaBars size={18} />
        </button>
      )}

      {/*  Sidebar Container */}
      <div
        className={`fixed ${
          isMobile ? "top-[77px]" : "top-[77px]"
        } left-0 h-[calc(100vh-75px)] bg-gradient-to-b from-indigo-200 via-blue-200 to-purple-200 shadow-2xl border-r border-indigo-200 flex flex-col justify-between items-center backdrop-blur-xl transition-transform duration-500 ease-in-out z-50 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        }`}
      >
        {/* Sidebar Content */}
        <div className="w-full flex flex-col items-center py-6 relative">
          {/*  Close Button for small screens */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="absolute top-3 right-3 bg-indigo-600 text-white p-1.5 rounded-full shadow-md hover:bg-indigo-700 transition"
            >
              <FaTimes size={14} />
            </button>
          )}

          {/*  Logo */}
          <div className="flex flex-col items-center mt-6">
            <img
              src={logo || "https://via.placeholder.com/80?text=EasyQuiz"}
              alt="EasyQuiz Logo"
              className="w-40 h-40 drop-shadow-md transition-all duration-300"
            />
            
          </div>

          {/*  Search Box */}
          <div className="relative w-[80%] mt-6">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-xl text-sm border border-indigo-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <FaSearch className="absolute left-3 top-2.5 text-indigo-500 text-sm" />
          </div>

          {/*  Menu Items */}
          <div className="flex flex-col gap-4 mt-8 w-[85%]">
            {menuItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-md ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-[1.05]"
                      : "bg-gradient-to-r from-indigo-400 to-blue-500 text-white hover:from-indigo-500 hover:to-blue-600 hover:scale-105"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/*  Footer */}
        <div className="mb-4 text-xs text-indigo-600 opacity-70">
          <p>© 2025 EasyQuiz Admin</p>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
