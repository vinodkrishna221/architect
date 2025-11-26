"use client";

import { motion } from "framer-motion";
import { Check, Code2, Database } from "lucide-react";

export const SplitArtifactVisual = () => {
    return (
        <>
            <div className="flex gap-4 justify-center py-4 relative h-40">
                {/* Backend Card - The Split */}
                <motion.div
                    initial={{ x: 30, opacity: 0, scale: 0.9 }}
                    whileInView={{ x: 0, opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{
                        duration: 0.8,
                        ease: "backOut",
                        delay: 0.2
                    }}
                    whileHover={{ y: -5 }}
                    className="w-32 p-4 rounded-lg bg-zinc-950 border border-white/10 flex flex-col gap-3 absolute left-[calc(50%-8.5rem)] top-4 z-10"
                >
                    <div className="p-2 bg-blue-500/10 rounded-md w-fit">
                        <Database className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-zinc-300 mb-1">backend.md</div>
                        <div className="space-y-1">
                            <div className="h-1 w-full bg-zinc-800 rounded-full" />
                            <div className="h-1 w-2/3 bg-zinc-800 rounded-full" />
                        </div>
                    </div>
                </motion.div>

                {/* Frontend Card - The Split */}
                <motion.div
                    initial={{ x: -30, opacity: 0, scale: 0.9 }}
                    whileInView={{ x: 0, opacity: 1, scale: 1 }}
                    viewport={{ once: false }}
                    transition={{
                        duration: 0.8,
                        ease: "backOut",
                        delay: 0.2
                    }}
                    whileHover={{ y: -5 }}
                    className="w-32 p-4 rounded-lg bg-zinc-950 border border-white/10 flex flex-col gap-3 absolute right-[calc(50%-8.5rem)] top-4 z-20"
                >
                    <div className="p-2 bg-purple-500/10 rounded-md w-fit">
                        <Code2 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-zinc-300 mb-1">frontend.md</div>
                        <div className="space-y-1">
                            <div className="h-1 w-full bg-zinc-800 rounded-full" />
                            <div className="h-1 w-2/3 bg-zinc-800 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* The Stamp - Heavy Physics */}
            <motion.div
                initial={{ scale: 2, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                    delay: 1,
                    type: "spring",
                    stiffness: 300,
                    damping: 15,
                    mass: 1.5
                }}
                className="text-center mt-4 relative z-30"
            >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-bold text-green-400 uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(74,222,128,0.5)] mix-blend-plus-lighter">
                    <Check className="w-3 h-3" />
                    Ready for Cursor
                </div>
            </motion.div>
        </>
    );
};
