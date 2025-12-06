import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowRight, CheckCircle, Star, Shield, Clock, Zap } from "lucide-react";

import MagneticButton from "../components/ui/MagneticButton";
import GlassCard from "../components/ui/GlassCard";
import FloatingElement from "../components/ui/FloatingElement";
import InputGroup from "../components/ui/InputGroup";
import ThemeToggle from "../components/ui/ThemeToggle";

// Minimal Navbar
const Navbar = () => (
  <motion.nav
    initial={{ y: -100 }}
    animate={{ y: 0 }}
    transition={{ duration: 0.5 }}
    className="w-full px-6 py-6 flex justify-between items-center fixed top-0 z-50 pointer-events-none"
  >
    <div className="pointer-events-auto flex items-center gap-2">
      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
        <span className="font-bold text-primary-foreground text-xl">D</span>
      </div>
      <div className="text-xl font-bold tracking-tight hidden md:block">DEProject</div>
    </div>

    <div className="pointer-events-auto flex items-center gap-4">
      <RouterLink to="/admin">
        <button className="px-4 py-2 rounded-lg bg-transparent border border-gray-500/30 text-sm font-medium hover:bg-foreground hover:text-background transition-all duration-300 backdrop-blur-sm">
          Admin Panel
        </button>
      </RouterLink>
      <ThemeToggle />
    </div>
  </motion.nav>
);

const LandingPage = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", message: "" });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans selection:bg-primary/30">
      {/* Background Noise & Ambient Glow */}
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay"></div>
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center text-center px-6 relative z-10 pt-20">
        <motion.div
          style={{ y: y1, opacity }}
          className="max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border backdrop-blur-sm text-sm font-medium text-secondary-foreground mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live in your city
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1]">
              The Ultimate <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-foreground to-primary/50">
                Household Services
              </span>{" "}
              Platform
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl leading-relaxed"
          >
            Connects users with household service providers in a fast and seamless way.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
          >
            <RouterLink to="/signin" className="w-full sm:w-auto">
              <MagneticButton className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]">
                Sign in as User
              </MagneticButton>
            </RouterLink>
            <RouterLink to="/signin" className="w-full sm:w-auto">
              <MagneticButton className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm">
                Sign in as Provider
              </MagneticButton>
            </RouterLink>
          </motion.div>
        </motion.div>

        {/* Floating Elements for visual interest */}
        <FloatingElement delay={0} duration={8} className="absolute top-1/4 left-[10%] opacity-20 blur-[2px] hidden lg:block pointer-events-none">
          <Shield className="w-24 h-24 text-primary" />
        </FloatingElement>
        <FloatingElement delay={2} duration={9} className="absolute bottom-1/3 right-[10%] opacity-20 blur-[2px] hidden lg:block pointer-events-none">
          <Zap className="w-20 h-20 text-secondary-foreground" />
        </FloatingElement>
      </section>

      {/* Contact Section - Minimal Redesign */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">We'd love to hear from you.</p>
            </div>

            <GlassCard className="p-8 md:p-12 bg-card/40 border-border/50 backdrop-blur-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputGroup
                    label="Name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                  />
                  <InputGroup
                    label="Email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground ml-1">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-5 py-4 rounded-xl bg-input/50 text-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all duration-300 resize-none placeholder-muted-foreground/50"
                    placeholder="How can we help?"
                  ></textarea>
                </div>
                <div className="flex justify-center pt-2">
                  <MagneticButton
                    type="submit"
                    className="px-12 py-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-bold text-lg flex items-center gap-2 transition-all duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </MagneticButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Footer Credits */}
      <footer className="py-8 text-center border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground font-medium">
          Made by <span className="text-foreground">Rushi Bhatt</span>, <span className="text-foreground">Tirth Vadhvana</span>, <span className="text-foreground">Shyama Hadia</span> and <span className="text-foreground">Vishwa Brahmbhatt</span>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
