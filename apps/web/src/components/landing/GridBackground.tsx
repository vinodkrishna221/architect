"use client";

import { motion } from "framer-motion";

export const GridBackground = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Scanning Beam */}
            <motion.div
                animate={{
                    top: ["0%", "100%"],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute left-0 right-0 h-32 bg-gradient-to-b from-blue-500/0 via-blue-500/10 to-blue-500/0"
            />

            {/* Radial Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
        </div>
    );
};
