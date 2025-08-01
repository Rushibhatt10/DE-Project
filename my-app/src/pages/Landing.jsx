import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-scroll";
import {
  Plug, Droplets, Brush, Paintbrush2,
  Hammer, Fan, ShieldCheck, UserCheck,
  Timer, Mail
} from "lucide-react";
import DarkVeil from "../components/DarkVeil";
import { Link as RouterLink } from "react-router-dom";


// Navbar component for page anchor navigation
const Navbar = () => (
  <nav className="w-full px-6 py-4 bg-black/40 backdrop-blur-sm text-white flex justify-between items-center fixed top-0 z-50">
    <div className="text-2xl font-bold text-teal-400">DEProject</div>
    <div className="space-x-6 text-sm">
      <Link to="about" smooth={true} duration={500} className="cursor-pointer hover:text-teal-400">About</Link>
      <Link to="services" smooth={true} duration={500} className="cursor-pointer hover:text-teal-400">Services</Link>
      <Link to="contact" smooth={true} duration={500} className="cursor-pointer hover:text-teal-400">Contact</Link>
    </div>
  </nav>
);

const services = [
  { title: "Electrician", icon: <Plug className="w-6 h-6 text-teal-400" /> },
  { title: "Plumber", icon: <Droplets className="w-6 h-6 text-teal-400" /> },
  { title: "Cleaner", icon: <Brush className="w-6 h-6 text-teal-400" /> },
  { title: "Painter", icon: <Paintbrush2 className="w-6 h-6 text-teal-400" /> },
  { title: "Carpenter", icon: <Hammer className="w-6 h-6 text-teal-400" /> },
  { title: "AC Mechanic", icon: <Fan className="w-6 h-6 text-teal-400" /> },
];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
  }),
};

// Reusable section component
const Section = ({ title, children, id }) => (
  <section id={id} className="min-h-screen flex flex-col justify-center items-center px-4 py-16">
    <motion.h2
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="text-4xl font-bold mb-4 text-teal-400"
    >
      {title}
    </motion.h2>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="text-center text-white max-w-3xl"
    >
      {children}
    </motion.div>
  </section>
);

const LandingPage = () => (
  <div className="relative bg-[#0f0f0f] text-white overflow-hidden">
    <DarkVeil hueShift={10} noiseIntensity={0.05} scanlineIntensity={0.2} speed={0.3}
      scanlineFrequency={25} warpAmount={0.05} resolutionScale={1} />
    <div className="absolute inset-0 bg-[#0f0f0f] z-0" />
    <div className="absolute inset-0 bg-black/20 z-[1]" />

    <div className="relative z-10">
      <Navbar />

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 pt-28">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-extrabold text-white"
        >
          On‑Demand Household & Tiffin Services
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 text-lg text-white"
        >
          Book skilled professionals instantly. Plumbing, electrical, tiffin services in just a few clicks.
        </motion.p>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <RouterLink
            to="/signup"
            className="inline-block mt-8 px-6 py-3 rounded-full bg-teal-800 hover:bg-teal-400 text-white font-semibold transition-all"
          >
            Get Started
          </RouterLink>
        </motion.div>
      </section>

      {/* About */}
      <Section title="About Us" id="about">
        We bridge the gap between users and verified professionals. Our platform simplifies bookings, ensures reliability, and delivers fast solutions.
      </Section>

      {/* Services */}
      <Section title="Our Services" id="services">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-6 mt-6">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              className="bg-[#1e1e1e] p-4 rounded-xl shadow-md hover:shadow-teal-500/20 text-center"
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={idx + 1}
            >
              <div className="flex justify-center mb-2">{service.icon}</div>
              <p className="text-sm font-semibold text-white">{service.title}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Us" id="contact">
        <form action="https://getform.io/f/bkknqryb" method="POST" className="mt-6 space-y-4 w-full max-w-lg mx-auto">
          <input type="text" name="name" placeholder="Your Name" required
            className="w-full px-4 py-2 rounded-lg bg-[#1f1f1f] text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <input type="email" name="email" placeholder="Your Email" required
            className="w-full px-4 py-2 rounded-lg bg-[#1f1f1f] text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <textarea name="message" placeholder="Your Message" required rows="4"
            className="w-full px-4 py-2 rounded-lg bg-[#1f1f1f] text-white border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"></textarea>
          <button type="submit"
            className="w-full px-6 py-3 rounded-full bg-teal-800 hover:bg-teal-400 text-white font-bold transition-all flex justify-center items-center">
            <Mail className="w-5 h-5 mr-2" /> Send Message
          </button>
        </form>
      </Section>

      <footer className="text-center py-6 text-sm text-white">
        &copy; {new Date().getFullYear()} DEProject. All rights reserved.
      </footer>
    </div>
  </div>
);

export default LandingPage;
