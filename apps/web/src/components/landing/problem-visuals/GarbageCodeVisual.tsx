"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const GarbageCodeVisual = () => {
    const [text, setText] = useState("");
    const fullText = "function doStuff() {";
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 40);
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black/40 rounded-lg p-4 text-left font-mono text-xs border border-white/5 mt-auto h-32 overflow-hidden relative">
            <div className="text-zinc-500 mb-1">
                {step < 10 ? fullText.slice(0, step) : fullText}
                {step < 10 && <span className="animate-pulse">|</span>}
            </div>

            {step >= 10 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pl-4 text-zinc-300"
                >
                    {step < 20 ? "error here;" : <span className="text-red-400 line-through decoration-red-500">error here;</span>}
                </motion.div>
            )}

            {step >= 20 && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="pl-4 text-zinc-300"
                >
                    return <span className="text-red-400 underline decoration-wavy font-bold">null</span>;
                </motion.div>
            )}

            {step >= 25 && (
                <div className="text-zinc-500">{"}"}</div>
            )}

            {/* Glitch Overlay */}
            <motion.div
                animate={{
                    opacity: [0, 0.1, 0, 0.2, 0],
                    x: [0, -5, 5, -2, 0]
                }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatDelay: 2
                }}
                className="absolute inset-0 bg-red-500/10 pointer-events-none mix-blend-overlay"
            />
        </div>
    );
};
