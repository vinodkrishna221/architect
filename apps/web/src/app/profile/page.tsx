"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Logo } from "@/components/ui/Logo";
import { Dock } from "@/components/dashboard/layout/Dock";

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <AuroraBackground>
                <KineticBackground>
                    <div className="flex items-center justify-center h-screen">
                        <div className="animate-pulse text-white">Loading...</div>
                    </div>
                </KineticBackground>
            </AuroraBackground>
        );
    }

    return (
        <AuroraBackground>
            <KineticBackground>
                <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20">
                    <Dock />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-30"
                    >
                        {/* Profile Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
                            <div className="flex flex-col items-center gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {session?.user?.email?.[0]?.toUpperCase() || "U"}
                                </div>

                                {/* User Info */}
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-white mb-2">
                                        {session?.user?.name || "User"}
                                    </h1>
                                    <p className="text-white/70">
                                        {session?.user?.email || "No email"}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-white">0</p>
                                        <p className="text-white/50 text-sm">Projects</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <p className="text-2xl font-bold text-white">0</p>
                                        <p className="text-white/50 text-sm">Blueprints</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </KineticBackground>
        </AuroraBackground>
    );
}
