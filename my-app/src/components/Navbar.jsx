// src/components/Navbar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeToggle from "C:\Users\Rushi Bhatt\OneDrive\Desktop\SERVICES\my-app\src\components\ThemeToggle.jsx"; // Make sure this path is correct

const Navbar = () => {
  const location = useLocation();

  const isHashLink = (path) => path.startsWith("#");

  const handleHashClick = (e, hash) => {
    e.preventDefault();
    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, null, hash);
    }
  };

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Services", path: "#services" },
    { label: "Contact", path: "#contact" },
    { label: "Dashboard", path: "/dashboard" },
  ];

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/30 dark:bg-gray-900/80 border-b border-white/10 dark:border-gray-700 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-pink-500">
          DEServices
        </Link>

        <div className="hidden md:flex space-x-6 text-sm font-medium items-center">
          {navItems.map(({ label, path }, index) => {
            if (isHashLink(path)) {
              return (
                <a
                  key={index}
                  href={path}
                  onClick={(e) => handleHashClick(e, path)}
                  className="transition duration-300 hover:text-pink-400 text-gray-200 dark:text-gray-300 cursor-pointer"
                >
                  {label}
                </a>
              );
            }

            return (
              <Link
                key={index}
                to={path}
                className={`transition duration-300 hover:text-pink-400 ${
                  location.pathname === path
                    ? "text-pink-400"
                    : "text-gray-200 dark:text-gray-300"
                }`}
              >
                {label}
              </Link>
            );
          })}

          {/* Dark Mode Toggle Button */}
          <ThemeToggle />
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
