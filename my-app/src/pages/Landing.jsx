import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import {
  Hammer,
  Brush,
  Plug,
  Fan,
  Droplets,
  Paintbrush2,
  Mail,
  ShieldCheck,
  UserCheck,
  Timer,
} from "lucide-react";
import DarkVeil from "../components/DarkVeil"; // Make sure path is correct

const services = [
  { title: "Electrician", icon: <Plug className="w-6 h-6 text-indigo-500" /> },
  { title: "Plumber", icon: <Droplets className="w-6 h-6 text-blue-500" /> },
  { title: "Cleaner", icon: <Brush className="w-6 h-6 text-green-500" /> },
  { title: "Painter", icon: <Paintbrush2 className="w-6 h-6 text-yellow-500" /> },
  { title: "Carpenter", icon: <Hammer className="w-6 h-6 text-orange-500" /> },
  { title: "AC Mechanic", icon: <Fan className="w-6 h-6 text-teal-500" /> },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
};

const LandingPage = () => {
  return (
    <div className="relative overflow-hidden font-Manrope text-gray-800 dark:text-white scroll-smooth">
      {/* 🌌 Animated Background */}
      <DarkVeil
        hueShift={10}
        noiseIntensity={0.05}
        scanlineIntensity={0.2}
        speed={0.3}
        scanlineFrequency={25}
        warpAmount={0.05}
        resolutionScale={1}
      />

      {/* Overlay tint for readability */}
      <div className="absolute inset-0 bg-black/20 z-[1]" />

      {/* Page content */}
      <div className="relative z-10 bg-gradient-to-br from-white to-pink-50 dark:from-[#1e1e2e] dark:to-[#121212] min-h-screen">

        {/* Navbar */}
        <header className="bg-white/80 backdrop-blur-md dark:bg-[#1e1e2ecc] shadow px-6 py-4 flex justify-between items-center fixed w-full z-50">
          <h1 className="text-xl font-bold text-pink-600">DE Project</h1>
          <nav className="space-x-6 text-sm">
            <Link to="about" smooth={true} duration={600} className="cursor-pointer hover:text-pink-500">
              About
            </Link>
            <Link to="features" smooth={true} duration={600} className="cursor-pointer hover:text-pink-500">
              Features
            </Link>
            <Link to="contact" smooth={true} duration={600} className="cursor-pointer hover:text-pink-500">
              Contact
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center text-center pt-24 px-4">
          <motion.h2
            className="text-5xl font-extrabold text-pink-600"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            On-Demand Household & Tiffin Services
          </motion.h2>
          <motion.p
            className="mt-4 text-gray-600 dark:text-gray-300 max-w-xl"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            Book skilled professionals instantly. Plumbing, electrical, and tiffin services in just a few clicks.
          </motion.p>
          <motion.div
            className="mt-6"
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            <a
              href="/signup"
              className="bg-pink-500 text-white px-6 py-3 rounded-lg shadow hover:bg-pink-600 transition"
            >
              Get Started
            </a>
          </motion.div>
        </section>

        {/* About Section */}
        <section id="about" className="min-h-screen flex flex-col justify-center px-6 text-center">
          <motion.h3
            className="text-4xl font-bold text-pink-500 mb-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            About Us
          </motion.h3>
          <motion.p
            className="text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
          >
            We bridge the gap between users and skilled professionals for reliable household and food services.
            Our platform simplifies bookings, ensures verified providers, and delivers fast solutions.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[ShieldCheck, UserCheck, Timer].map((Icon, idx) => (
              <motion.div
                key={idx}
                className="bg-white/80 dark:bg-gray-800 p-6 rounded-xl shadow-md text-center"
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={idx + 1}
              >
                <Icon className="w-10 h-10 mx-auto text-pink-500 mb-2" />
                <h4 className="text-lg font-semibold mb-1">
                  {idx === 0 ? "Secure & Verified" : idx === 1 ? "User Friendly" : "Quick Response"}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {idx === 0
                    ? "All service providers undergo strict verification and ID checks."
                    : idx === 1
                    ? "Easy-to-use dashboard for users and providers with real-time tracking."
                    : "Instant confirmations and fast service delivery at your doorstep."}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="min-h-screen flex flex-col justify-center px-6">
          <div className="max-w-6xl mx-auto text-center">
            <motion.h3
              className="text-4xl font-extrabold text-pink-500 mb-4"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              What’s waiting for you on the website?
            </motion.h3>
            <motion.p
              className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-12"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={2}
            >
              Our website offers a variety of household services to cater to your every need.
            </motion.p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
              {services.map((service, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white/80 dark:bg-gray-800 p-4 rounded-xl shadow-md hover:shadow-lg transition hover:scale-105"
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={idx + 1}
                >
                  <div className="flex justify-center mb-2">{service.icon}</div>
                  <p className="text-sm font-semibold">{service.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen flex items-center justify-center flex-col px-6 text-center">
          <motion.h3
            className="text-4xl font-bold text-pink-500 mb-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            Contact Us
          </motion.h3>
          <motion.p
            className="text-gray-700 dark:text-gray-300 max-w-xl mb-6"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={2}
          >
            Got questions or suggestions? Let’s talk.
          </motion.p>
          <motion.form
            action="https://getform.io/f/bkknqryb"
            method="POST"
            className="w-full max-w-xl bg-white/80 dark:bg-gray-800 p-6 rounded-xl shadow space-y-4"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={3}
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900"
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              required
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900"
            />
            <textarea
              name="message"
              placeholder="Your Message"
              required
              rows="4"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-900"
            />
            <button
              type="submit"
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg shadow flex items-center justify-center mx-auto"
            >
              <Mail className="inline w-5 h-5 mr-1" /> Send Message
            </button>
          </motion.form>
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} DEProject. All rights reserved. Made with ❤️ by Rushi
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
