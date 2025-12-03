"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { User, Mail, Edit2, Camera } from "lucide-react";
import { MagneticButton } from "../shared/MagneticButton";

export function ProfileCard() {
    const [isHovered, setIsHovered] = useState(false);

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1] as const,
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ willChange: "transform, opacity" }}
            className="w-full max-w-[500px] relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Obsidian Glass Card */}
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="p-8 relative z-12 flex flex-col items-center">

                    {/* Avatar Section */}
                    <motion.div variants={itemVariants} className="relative mb-6 group cursor-pointer">
                        <div className="w-32 h-32 rounded-full bg-zinc-800 border-2 border-white/10 overflow-hidden relative shadow-xl">
                            {/* Placeholder Avatar */}
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                                <User className="w-12 h-12 text-zinc-500" />
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <Camera className="w-8 h-8 text-white/80" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full border-4 border-black flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                    </motion.div>

                    {/* User Info */}
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">John Doe</h1>
                        <p className="text-zinc-400 text-sm font-mono">@johndoe</p>
                    </motion.div>

                    {/* Details Card */}
                    <motion.div variants={itemVariants} className="w-full bg-zinc-900/50 rounded-xl border border-white/5 p-4 mb-8 space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Email</p>
                                <p className="text-zinc-200">john@example.com</p>
                            </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center">
                                <User className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div className="flex-1">
                                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-0.5">Member Since</p>
                                <p className="text-zinc-200">March 2025</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <motion.div variants={itemVariants} className="w-full">
                        <MagneticButton className="w-full h-12 bg-white text-black rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
                            <Edit2 className="w-4 h-4" />
                            Edit Profile
                        </MagneticButton>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    );
}
