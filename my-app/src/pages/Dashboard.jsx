// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Briefcase } from "lucide-react";
import GlassCard from "../components/ui/GlassCard";
import MagneticButton from "../components/ui/MagneticButton";
import FloatingElement from "../components/ui/FloatingElement";

function Dashboard() {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    localStorage.setItem("userRole", role);
    navigate("/signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4 font-sans transition-colors duration-300">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay"></div>
      <FloatingElement className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
      <FloatingElement delay={2} className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-2xl relative z-10"
      >
        <GlassCard className="p-10 md:p-16 border-border bg-card/60 backdrop-blur-xl shadow-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
            Choose Your Role
          </h1>
          <p className="text-muted-foreground text-lg mb-12 max-w-lg mx-auto">
            Join us to find services or offer your expertise. Select how you want to proceed.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <MagneticButton
              onClick={() => handleSelectRole("user")}
              className="group relative p-8 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 transition-all flex flex-col items-center gap-4 hover:border-primary/50"
            >
              <div className="p-4 rounded-full bg-background text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-1">I am a User</h3>
                <p className="text-sm text-muted-foreground">Looking for services</p>
              </div>
            </MagneticButton>

            <MagneticButton
              onClick={() => handleSelectRole("provider")}
              className="group relative p-8 rounded-2xl bg-secondary border border-border hover:bg-secondary/80 transition-all flex flex-col items-center gap-4 hover:border-primary/50"
            >
              <div className="p-4 rounded-full bg-background text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-foreground mb-1">I am a Provider</h3>
                <p className="text-sm text-muted-foreground">Offering services</p>
              </div>
            </MagneticButton>
          </div>

          <p className="text-sm text-muted-foreground mt-10">
            You’ll be redirected to signup.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

export default Dashboard;
