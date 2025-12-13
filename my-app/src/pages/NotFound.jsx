import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-background relative overflow-hidden font-sans selection:bg-cyan-500/20">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/20 leading-tight tracking-tighter mb-4">
          404
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-4 tracking-wide uppercase">
          Page Not Found
        </p>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <Link to="/">
          <button className="px-8 py-3 bg-foreground text-background dark:bg-cyan-500 dark:text-black font-bold uppercase tracking-widest rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all duration-300">
            Go Back Home
          </button>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
