"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginCard } from "@/components/auth/LoginCard";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
    const [isIntroComplete, setIsIntroComplete] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsIntroComplete(true);
        }, 2000); // Extended intro duration (2s)
        return () => clearTimeout(timer);
    }, []);

    return (
        <AuroraBackground>
            <KineticBackground>
                <div className="relative w-full h-full flex flex-col items-center justify-center px-4">

                    {/* Brand-First Sequence */}
                    <motion.div
                        layout
                        className={`relative z-30 flex flex-col items-center ${isIntroComplete ? "gap-8" : "gap-0"}`}
                    >
                        {/* Logo: Moves from Center to Top */}
                        <motion.div
                            layoutId="brand-logo"
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }} // Slower, cinematic move
                            className="relative z-30"
                        >
                            <motion.div
                                animate={!isIntroComplete ? {
                                    scale: [1, 1.1, 1],
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                                } : {}}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Logo showText={false} className="w-20 h-20" />
                            </motion.div>
                        </motion.div>

                        {/* Login Card: Appears after Logo moves */}
                        <AnimatePresence>
                            {isIntroComplete && (
                                <motion.div
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: { duration: 0.8, delay: 0.5, ease: "easeOut" }
                                        }
                                    }}
                                    initial="hidden"
                                    animate="visible"
                                    className="relative z-30 w-full flex justify-center"
                                >
                                    <LoginCard />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                </div>
            </KineticBackground>
        </AuroraBackground>
    );
}
