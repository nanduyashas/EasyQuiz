// frontend/src/components/Toast.jsx
import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

/**
 * Toast component
 * Props:
 *  - toasts: [{ id, type: 'success'|'error'|'info', message }]
 *  - onRemove(id): function to remove a toast early
 *  - position: optional ("bottom-right" default)
 */
const Toast = ({ toasts = [], onRemove = () => {}, position = "bottom-right" }) => {
  // Accessibility: remove toasts when Escape pressed
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        toasts.forEach((t) => onRemove(t.id));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toasts, onRemove]);

  const posClass =
    position === "bottom-left"
      ? "left-6 bottom-6"
      : position === "top-right"
      ? "right-6 top-6"
      : "right-6 bottom-6"; // default bottom-right

  return (
    <div className={`fixed z-50 flex flex-col gap-3 ${posClass}`} aria-live="polite">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`w-80 max-w-xs p-3 rounded-lg shadow-lg border transform transition-all duration-300
            ${t.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
            ${t.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
            ${t.type === "info" ? "bg-indigo-50 border-indigo-200 text-indigo-800" : ""}
          `}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {t.type === "success" && <FaCheckCircle className="text-green-600" />}
              {t.type === "error" && <FaTimesCircle className="text-red-600" />}
              {t.type === "info" && <FaTimesCircle className="text-indigo-600" style={{ opacity: 0.9 }} />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{t.message}</div>
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className="ml-2 text-xs text-gray-500 hover:text-gray-700"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Toast;
