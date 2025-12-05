import React from "react";
import { motion } from "framer-motion";

const Card = ({ children, className, hoverEffect = true, onClick }) => {
    return (
        <motion.div
            onClick={onClick}
            className={`bg-card border border-border rounded-xl shadow-sm ${className}`}
            initial={hoverEffect ? { y: 0 } : {}}
            whileHover={
                hoverEffect
                    ? {
                        y: -4,
                        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                        borderColor: "hsl(var(--primary))",
                    }
                    : {}
            }
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

export default Card;
