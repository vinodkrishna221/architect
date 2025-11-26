"use client";

import { motion } from "framer-motion";

const TERMINAL_LINES = [
    "> INITIALIZING BUILD SEQUENCE...",
    "> LOADING ARCHITECT CORE...",
    "> ANALYZING PROJECT STRUCTURE...",
    "> OPTIMIZING DEPENDENCIES...",
    "> VERIFYING SECURITY PROTOCOLS...",
    "> GENERATING BLUEPRINTS...",
    "> COMPILING ASSETS...",
    "> DEPLOYING TO PRODUCTION...",
    "> SYSTEM READY.",
    "> AWAITING USER INPUT...",
];

export const TerminalOverlay = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10 select-none font-mono text-xs md:text-sm text-green-500/50">
            <motion.div
                animate={{ y: ["0%", "-50%"] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="flex flex-col gap-2 p-8"
            >
                {[...TERMINAL_LINES, ...TERMINAL_LINES, ...TERMINAL_LINES].map((line, i) => (
                    <div key={i}>{line}</div>
                ))}
            </motion.div>
        </div>
    );
};
