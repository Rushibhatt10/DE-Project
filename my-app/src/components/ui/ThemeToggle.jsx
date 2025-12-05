import React, { useEffect, useState } from "react";
import { Moon, Sun, Laptop } from "lucide-react";
import { motion } from "framer-motion";

const ThemeToggle = () => {
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "system"
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");

        if (theme === "system") {
            const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
                .matches
                ? "dark"
                : "light";
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <div className="flex items-center gap-1 p-1 rounded-full bg-secondary border border-border">
            {["light", "system", "dark"].map((t) => (
                <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`p-2 rounded-full transition-all ${theme === t
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                >
                    {t === "light" && <Sun className="w-4 h-4" />}
                    {t === "system" && <Laptop className="w-4 h-4" />}
                    {t === "dark" && <Moon className="w-4 h-4" />}
                </button>
            ))}
        </div>
    );
};

export default ThemeToggle;
