import React from "react";

const DealConfirmationPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="bg-white dark:bg-gray-900 shadow-xl rounded-2xl p-8 w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-4">Deal Confirmed 🎉</h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          Your service request has been successfully confirmed. You will receive updates via your dashboard and email.
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition duration-300"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
};

export default DealConfirmationPage;
