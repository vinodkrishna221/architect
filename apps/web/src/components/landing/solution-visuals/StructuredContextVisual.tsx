"use client";

import { motion } from "framer-motion";
import { Brain, FileText, MessageSquare } from "lucide-react";

export const StructuredContextVisual = () => {
    return (
        <div className="flex flex-col items-center justify-center py-8">
            {/* Inputs merging - The Merge */}
            <div className="flex gap-4 mb-4 relative h-16 w-full justify-center">
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 0.5 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-12 h-16 border border-dashed border-zinc-600 rounded flex items-center justify-center absolute left-[calc(50%-3rem)]"
                >
                    <FileText className="w-4 h-4 text-zinc-600" />
                </motion.div>

                <motion.div
                    initial={{ x: 40, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 0.5 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-12 h-16 border border-dashed border-zinc-600 rounded flex items-center justify-center absolute right-[calc(50%-3rem)]"
                >
                    <MessageSquare className="w-4 h-4 text-zinc-600" />
                </motion.div>
            </div>

            {/* The Core - The Pulse */}
            <div className="relative">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.6, 0.2]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-purple-500/40 blur-xl rounded-full mix-blend-plus-lighter"
                />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-20 h-20 bg-zinc-900 border border-purple-500/50 rounded-xl flex items-center justify-center relative z-10 shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]"
                >
                    <Brain className="w-8 h-8 text-purple-400" />
                </motion.div>

                {/* Connecting lines - The Connection & Particles */}
                <svg className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-20 overflow-visible pointer-events-none z-0" viewBox="0 0 160 80">
                    {/* Left Path */}
                    <motion.path
                        d="M 48 0 C 48 20 80 0 80 30"
                        fill="none"
                        stroke="url(#purple-gradient-left)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    />
                    {/* Left Particles */}
                    <motion.path
                        d="M 48 0 C 48 20 80 0 80 30"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="4 60"
                        strokeLinecap="round"
                        animate={{ strokeDashoffset: [0, -64] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mix-blend-plus-lighter"
                    />

                    {/* Right Path */}
                    <motion.path
                        d="M 112 0 C 112 20 80 0 80 30"
                        fill="none"
                        stroke="url(#purple-gradient-right)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                    />
                    {/* Right Particles */}
                    <motion.path
                        d="M 112 0 C 112 20 80 0 80 30"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                        strokeDasharray="4 60"
                        strokeLinecap="round"
                        animate={{ strokeDashoffset: [0, -64] }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mix-blend-plus-lighter"
                    />

                    <defs>
                        <linearGradient id="purple-gradient-left" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="purple-gradient-right" x1="100%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.5" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.2 }}
                className="mt-4 font-mono text-xs text-purple-400"
            >
                Context_Object.json
            </motion.div>
        </div>
    );
};
