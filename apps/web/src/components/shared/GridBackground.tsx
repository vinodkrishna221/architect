"use client";

import { motion } from "framer-motion";

export const GridBackground = () => {
    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Base Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Parallax Grid Layer (Larger, Fainter) */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:96px_96px]" />

            {/* Electric Scanning Beam */}
            <motion.div
                animate={{
                    top: ["0%", "100%"],
                    opacity: [0, 1, 0]
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute left-0 right-0 h-48 bg-gradient-to-b from-cyan-500/0 via-cyan-500/5 to-blue-500/0"
            />

            {/* Radial Vignette Mask */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />

            {/* Bottom Fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black" />
        </div>
    );
};
