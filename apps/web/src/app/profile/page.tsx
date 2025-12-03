"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ProfileCard } from "@/components/profile/ProfileCard";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Dock } from "@/components/dashboard/layout/Dock";

export default function ProfilePage() {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    return (
        <AuroraBackground>
            <KineticBackground>
                <div className="relative w-full h-full flex flex-col items-center justify-center px-4">

                    <AnimatePresence>
                        {isLoaded && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="relative z-30 w-full flex justify-center"
                            >
                                <ProfileCard />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Dock */}
                    <Dock position="bottom" />
                </div>
            </KineticBackground>
        </AuroraBackground>
    );
}
