import React from "react";
import { motion } from "framer-motion";

const FloatingElement = ({ children, delay = 0, duration = 5, className }) => {
    return (
        <motion.div
            className={className}
            animate={{
                y: ["0%", "-10%", "0%"],
                rotate: [0, 5, -5, 0],
            }}
            transition={{
                duration: duration,
                ease: "easeInOut",
                repeat: Infinity,
                delay: delay,
            }}
        >
            {children}
        </motion.div>
    );
};

export default FloatingElement;
