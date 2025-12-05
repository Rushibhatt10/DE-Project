import React, { useState } from "react";
import { motion } from "framer-motion";

const InputGroup = ({ label, type, name, value, onChange, required, placeholder }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div className="relative mb-6">
            <motion.label
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${focused || value
                        ? "-top-3 text-xs text-teal-400 bg-[#1f1f1f] px-1"
                        : "top-3 text-gray-400"
                    }`}
            >
                {label}
            </motion.label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full px-4 py-3 rounded-lg bg-[#1f1f1f] text-white border border-gray-700 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all duration-300"
                placeholder={focused ? placeholder : ""}
            />
        </div>
    );
};

export default InputGroup;
