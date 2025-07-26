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
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 dark:from-[#2a2a40] dark:to-[#3a3a60] text-black dark:text-white font-['Manrope'] transition-colors duration-500 relative">
      
      {/* Top-right Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center space-x-4">
        <Link
          to="/signin"
          className="bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 hover:shadow-pink-500/50 transition"
        >
          Sign In
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full shadow-md"
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06),transparent)] z-10" />
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
            className="bg-gradient-to-r from-pink-500 to-blue-500 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:scale-105 hover:shadow-pink-500/50 transition-all duration-300"
          >
            Get Started
          </Link>
        </motion.div>
      </section>

      {/* About Us Section */}
      <section className="px-6 py-20 bg-white dark:bg-[#1f1f2e] text-center">
        <h2 className="text-4xl font-bold text-pink-500 mb-4">About Us</h2>
        <p className="max-w-3xl mx-auto text-gray-700 dark:text-gray-300 mb-10 text-lg">
          At DEServices, we are dedicated to making everyday living easier by connecting users with top-quality household and tiffin service providers in their area. Whether you're looking for a home-cooked meal, a reliable cleaner, or a skilled handyman — we've got you covered with trust, transparency, and technology.
        </p>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: "Trusted Providers",
              desc: "All our service providers go through verification to ensure quality and safety for our users.",
            },
            {
              title: "Location Based Services",
              desc: "Our smart location feature matches you with the most relevant nearby service providers automatically.",
            },
            {
              title: "Fast & Simple",
              desc: "From signup to booking, our platform is optimized to give you the smoothest user experience possible.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="p-6 bg-gray-100 dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2 text-pink-500">
                {item.title}
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="px-6 py-24 bg-gray-50 dark:bg-[#2a2a40] relative z-10"
      >
        <h2 className="text-4xl font-bold text-center mb-8">Contact Us</h2>
        <p className="max-w-xl mx-auto text-center text-gray-700 dark:text-gray-300 mb-8">
          Reach out to us anytime! We're here to help you with your household and tiffin service needs.
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
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <textarea
            name="message"
            placeholder="Your Message"
            required
            rows={5}
            className="w-full p-3 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
        <p>
          © 2025 DEServices. All rights reserved. Made with ❤️ by Rushi
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
