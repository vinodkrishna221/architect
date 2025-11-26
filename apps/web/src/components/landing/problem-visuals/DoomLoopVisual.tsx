"use client";

import { motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

export const DoomLoopVisual = () => {
    return (
        <div className="w-full bg-black/40 rounded-lg p-4 border border-white/5 flex flex-col items-center justify-center gap-2 mt-auto relative overflow-hidden">
            <div className="flex items-center gap-1 w-full justify-center relative z-10">
                <div className="border border-white/20 px-2 py-1 text-[10px] rounded bg-white/5 text-zinc-300">Start</div>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <div className="border border-white/20 px-2 py-1 text-[10px] rounded bg-white/5 text-zinc-300">Code</div>
                <ArrowRight className="w-3 h-3 text-zinc-600" />
                <div className="border border-white/20 px-2 py-1 text-[10px] rounded bg-white/5 text-zinc-300">2k lines</div>
            </div>

            <div className="w-full h-px bg-white/5 my-1 relative">
                <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="absolute left-1/2 -top-1.5 -translate-x-1/2 z-20"
                >
                    <X className="w-3 h-3 text-red-500" />
                </motion.div>
            </div>

            <div className="flex items-center gap-1 w-full justify-center relative z-10">
                <div className="border border-white/20 px-2 py-1 text-[10px] rounded bg-white/5 text-zinc-300">Review</div>

                {/* Animated Error Path */}
                <div className="relative w-3 h-3 flex items-center justify-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <ArrowRight className="w-3 h-3 text-red-500" />
                    </motion.div>
                </div>

                <motion.div
                    animate={{
                        borderColor: ["rgba(239,68,68,0.3)", "rgba(239,68,68,1)", "rgba(239,68,68,0.3)"],
                        backgroundColor: ["rgba(239,68,68,0.1)", "rgba(239,68,68,0.3)", "rgba(239,68,68,0.1)"]
                    }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="border border-red-500/30 px-2 py-1 text-[10px] rounded bg-red-500/10 text-red-400 font-bold"
                >
                    Error
                </motion.div>
            </div>

            {/* Red Pulse Background */}
            <motion.div
                animate={{ opacity: [0, 0.2, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 bg-red-500/10 blur-xl"
            />
        </div>
    );
};
