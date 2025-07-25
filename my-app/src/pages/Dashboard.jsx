// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    localStorage.setItem("userRole", role);
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-[#0f0f1c] dark:to-[#1e1e2e] px-4">
      <div className="w-full max-w-lg p-10 bg-white dark:bg-white/10 border dark:border-white/10 shadow-xl backdrop-blur-xl rounded-2xl text-center space-y-6">
        <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400">Choose Your Role</h1>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <button
            onClick={() => handleSelectRole("user")}
            className="w-full md:w-auto px-6 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:scale-105 transition-transform"
          >
            I am a User
          </button>
          <button
            onClick={() => handleSelectRole("provider")}
            className="w-full md:w-auto px-6 py-3 text-white font-medium rounded-lg bg-gradient-to-r from-green-500 to-teal-500 hover:scale-105 transition-transform"
          >
            I am a Provider
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">You’ll be redirected to signup.</p>
      </div>
    </div>
  );
}

export default Dashboard;
