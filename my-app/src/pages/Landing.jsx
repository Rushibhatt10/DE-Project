import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

const LandingPage = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-white text-black dark:bg-gradient-to-br dark:from-[#0f0f1c] dark:to-[#1e1e2e] dark:text-white font-['Manrope'] transition-colors duration-500 relative">
      {/* Top-right Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-4">
        {/* Sign In Button */}
        <Link
          to="/signin"
          className="bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg backdrop-blur-lg hover:scale-105 hover:shadow-pink-500/50 transition-all duration-300"
        >
          Sign In
        </Link>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md hover:scale-105 transition"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-400" />
          ) : (
            <Moon className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent)] z-10" />
        <div className="absolute top-[-5rem] right-[-5rem] w-96 h-96 bg-pink-500 rounded-full blur-3xl opacity-30 animate-pulse z-0" />
        <div className="absolute bottom-[-5rem] left-[-5rem] w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse z-0" />

        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-6xl md:text-7xl font-extrabold leading-tight z-20 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-pink-400"
        >
          Household & Tiffin Services
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.3 }}
          className="max-w-xl mt-6 text-lg text-gray-700 dark:text-gray-300 z-20"
        >
          Experience luxury, hygiene, and convenience with our exclusive services — delivered with style.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="mt-10 z-20"
        >
          <Link
            to="/signup"
            className="bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg backdrop-blur-lg hover:scale-105 hover:shadow-pink-500/50 transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="px-6 py-24 bg-gray-50 dark:bg-[#222236] relative z-10"
      >
        <h2 className="text-4xl font-bold text-center mb-8 dark:text-white">
          Contact Us
        </h2>
        <p className="max-w-xl mx-auto text-center text-gray-700 dark:text-gray-300 mb-8">
          Reach out to us anytime! We're here to help you with your household and
          tiffin service needs.
        </p>

        <form
          action="https://getform.io/f/bkknqryb"
          method="POST"
          className="max-w-xl mx-auto space-y-6"
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={5}
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
          <button
            type="submit"
            className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded transition"
          >
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-[#1c1c2c] py-10 text-center text-gray-500 dark:text-gray-400 text-sm">
        <p>© 2025 DEServices. All rights reserved. Made with ❤️ by Rushi, Tirth, Vishwa & Shyama.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
