"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect, useState } from "react";

export const HallucinationVisual = () => {
    const [isHallucinating, setIsHallucinating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsHallucinating((prev) => !prev);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-black/40 rounded-lg p-4 text-left border border-white/5 mt-auto relative overflow-hidden">
            <div className="space-y-2 text-sm relative z-10">
                {["Auth", "RLS", "Payments"].map((item, index) => (
                    <div key={item} className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-zinc-400">
                            <div className="w-4 h-4 border border-white/10 rounded bg-white/5" /> {item}:
                        </span>
                        <div className="relative w-20 h-5">
                            <AnimatePresence mode="wait">
                                {!isHallucinating ? (
                                    <motion.span
                                        key="check"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-center text-green-400 text-xs font-bold absolute right-0 top-0"
                                    >
                                        <Check className="w-3 h-3 mr-1" /> Added
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="missing"
                                        initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, delay: index * 0.1 }}
                                        className="flex items-center text-red-400 text-xs font-bold absolute right-0 top-0"
                                    >
                                        <X className="w-3 h-3 mr-1" /> Missing
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {/* Glitch Background */}
            <motion.div
                animate={{
                    opacity: isHallucinating ? [0, 0.1, 0] : 0,
                }}
                transition={{ duration: 0.2, repeat: isHallucinating ? 3 : 0 }}
                className="absolute inset-0 bg-red-500/5 pointer-events-none"
            />
        </div>
    );
};
