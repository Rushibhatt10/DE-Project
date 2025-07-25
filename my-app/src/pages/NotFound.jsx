import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-pink-500">404</h1>
      <p className="text-lg text-gray-600 dark:text-gray-300">Page not found.</p>
      <Link to="/" className="mt-4 text-blue-500 hover:underline">Go Home</Link>
    </div>
  );
};

export default NotFound;
