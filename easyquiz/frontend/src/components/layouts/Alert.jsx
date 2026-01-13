import React from "react";

const Alert = ({ type = "success", message }) => {
  if (!message) return null;

  const styles = {
    success: "bg-green-100 text-green-700 border-green-300",
    error: "bg-red-100 text-red-700 border-red-300",
  };

  return (
    <div className={`border p-3 rounded-md mb-4 ${styles[type]}`}>
      {message}
    </div>
  );
};

export default Alert;
