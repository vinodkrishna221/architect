"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { GitBranch, MessageSquare, Shield, Terminal } from "lucide-react";

export const AmbiguityCheckVisual = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"],
    });

    const beamX = useTransform(scrollYProgress, [0, 1], ["-100%", "300%"]);

    return (
        <div ref={containerRef} className="space-y-4">
            {/* Raw Idea - The Scan */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.5 }}
                className="relative flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 overflow-hidden"
            >
                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center relative z-10">
                    <Terminal className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="h-2 w-24 bg-zinc-700 rounded-full relative z-10" />

                {/* Scanner Beam - Scrollytelling Controlled */}
                <motion.div
                    style={{ x: beamX }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-blue-500 to-transparent skew-x-12 opacity-50 mix-blend-plus-lighter"
                />
            </motion.div>

            {/* Arrow Down */}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                whileInView={{ opacity: 1, height: "auto" }}
                viewport={{ once: false }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex justify-center"
            >
                <GitBranch className="w-5 h-5 text-blue-500 rotate-180" />
            </motion.div>

            {/* Questions - The Interrogation */}
            <motion.div
                className="space-y-2"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, margin: "-50px" }}
                variants={{
                    visible: {
                        transition: {
                            staggerChildren: 0.1,
                            delayChildren: 0.2
                        }
                    }
                }}
            >
                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3"
                >
                    <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="space-y-1.5 w-full">
                        <div className="h-2 w-full bg-blue-400/20 rounded-full" />
                        <div className="h-2 w-2/3 bg-blue-400/20 rounded-full" />
                    </div>
                </motion.div>

                <motion.div
                    variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: { opacity: 1, y: 0 }
                    }}
                    className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-start gap-3"
                >
                    <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                    <div className="space-y-1.5 w-full">
                        <div className="h-2 w-3/4 bg-blue-400/20 rounded-full" />
                        <div className="h-2 w-1/2 bg-blue-400/20 rounded-full" />
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};
