"use client";

import { useState, useEffect, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Github, Lock, Loader2, Check, AlertCircle } from "lucide-react";
import { authenticate } from "@/features/auth/actions";

import { MagneticButton } from "../shared/MagneticButton";

export function LoginCard() {
    const [email, setEmail] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [status, setStatus] = useState<"idle" | "valid" | "loading" | "success" | "error">("idle");
    // const [isHovered, setIsHovered] = useState(false); // Unused
    const [shake, setShake] = useState(false);

    const [state, dispatch, isPending] = useActionState(authenticate, undefined);

    // Validate email and access code
    useEffect(() => {
        if (isPending || status === "success") return;
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isCodeValid = accessCode.length >= 6;
        setStatus(isEmailValid && isCodeValid ? "valid" : "idle");
    }, [email, accessCode, isPending, status]);

    // Handle server action state changes
    useEffect(() => {
        if (state) {
            if (state === "Login successful!") {
                setStatus("success");
            } else {
                setStatus("error");
                setShake(true);
                const timer = setTimeout(() => setShake(false), 500);
                return () => clearTimeout(timer);
            }
        }
    }, [state]);

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1] as const,
                staggerChildren: 0.05 // Faster stagger
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 }, // Reduced distance
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" as const }
        }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ willChange: "transform, opacity" }} // Hardware acceleration hint
            className="w-full max-w-[1100px] relative"
        // onMouseEnter={() => setIsHovered(true)}
        // onMouseLeave={() => setIsHovered(false)}
        >
            {/* Obsidian Glass Card */}
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="p-15 relative z-12 flex flex-col">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-8">
                        <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center mb-6 shadow-lg group">
                            <Lock className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Welcome back</h1>
                        <p className="text-zinc-400 text-sm">Enter your credentials to access the workspace.</p>
                    </motion.div>

                    {/* Input Form */}
                    <motion.div variants={itemVariants} className="w-full mb-6 relative group/input">
                        <form action={dispatch}>
                            <motion.div
                                animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
                                transition={{ duration: 0.4 }}
                                className="relative"
                            >
                                <input
                                    type="email"
                                    name="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="dev@architect.io"
                                    disabled={isPending || status === "success"}
                                    className="w-full h-14 bg-zinc-900/50 border border-white/10 rounded-xl px-4 pr-14 
                                             text-white placeholder:text-zinc-600 font-mono text-sm 
                                             outline-none transition-all duration-300
                                             focus:border-blue-500/50 focus:bg-zinc-900/80 focus:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)] mb-3"
                                />
                                <input
                                    type="password"
                                    name="accessCode"
                                    value={accessCode}
                                    onChange={(e) => setAccessCode(e.target.value)}
                                    placeholder="Access Code"
                                    disabled={isPending || status === "success"}
                                    className="w-full h-14 bg-zinc-900/50 border border-white/10 rounded-xl px-4 pr-14 
                                             text-white placeholder:text-zinc-600 font-mono text-sm 
                                             outline-none transition-all duration-300
                                             focus:border-blue-500/50 focus:bg-zinc-900/80 focus:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]"
                                />

                                {/* Smart Submit Button */}
                                <div className="absolute right-2 top-2 bottom-2">
                                    <AnimatePresence mode="wait">
                                        {isPending ? (
                                            <motion.div
                                                key="loading"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                className="h-full aspect-square flex items-center justify-center"
                                            >
                                                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                            </motion.div>
                                        ) : status === "success" ? (
                                            <motion.div
                                                key="success"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="h-full aspect-square bg-green-500/20 rounded-lg flex items-center justify-center border border-green-500/50"
                                            >
                                                <Check className="w-5 h-5 text-green-500" />
                                            </motion.div>
                                        ) : (
                                            <motion.button
                                                key="arrow"
                                                type="submit"
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: 1,
                                                    boxShadow: status === "valid" ? "0 0 15px rgba(59,130,246,0.5)" : "none",
                                                    scale: status === "valid" ? [1, 1.05, 1] : 1
                                                }}
                                                transition={status === "valid" ? {
                                                    boxShadow: { duration: 0.3 },
                                                    scale: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } // Heartbeat pulse
                                                } : {}}
                                                whileHover={status === "valid" ? { scale: 1.1 } : {}}
                                                whileTap={status === "valid" ? { scale: 0.95 } : {}}
                                                disabled={status !== "valid"}
                                                className={`h-full aspect-square rounded-lg flex items-center justify-center transition-colors duration-300 ${status === "valid"
                                                    ? "bg-blue-500 text-white cursor-pointer"
                                                    : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                                                    }`}
                                            >
                                                <ArrowRight className={`w-4 h-4 ${status === "valid" ? "translate-x-0" : "-translate-x-0.5"}`} />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        </form>
                        {/* Error Message */}
                        <AnimatePresence>
                            {state && status === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-red-500 text-xs font-medium"
                                >
                                    <AlertCircle className="w-3 h-3" />
                                    <span>{state}</span>
                                </motion.div>
                            )}
                            {state && status === "success" && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute -bottom-8 left-0 right-0 flex items-center justify-center gap-2 text-green-500 text-xs font-medium"
                                >
                                    <Check className="w-3 h-3" />
                                    <span>{state}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={itemVariants} className="w-full flex items-center gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">Or continue with</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </motion.div>

                    {/* Social Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-8">
                        <MagneticButton className="h-12 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center gap-3 transition-colors group relative overflow-hidden">
                            <svg className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all duration-300" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">Google</span>
                        </MagneticButton>

                        <MagneticButton className="h-12 bg-zinc-900/50 border border-white/5 rounded-xl flex items-center justify-center gap-3 transition-colors group relative overflow-hidden">
                            <Github className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                            <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">GitHub</span>
                        </MagneticButton>
                    </motion.div>

                    {/* Footer */}
                    <motion.p variants={itemVariants} className="text-center text-xs text-zinc-600">
                        Don't have an account? <a href="/signup" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-4">Sign up</a>
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
