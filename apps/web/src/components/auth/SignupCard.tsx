"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, Variants } from "framer-motion";
import { ArrowRight, Github, Lock, Loader2, Check, Mail, User } from "lucide-react";

// Magnetic Button Component (Reused)
const MagneticButton = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current!.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((clientX - centerX) * 0.2);
        y.set((clientY - centerY) * 0.2);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            onClick={onClick}
            className={className}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {children}
        </motion.button>
    );
};

export function SignupCard() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "valid" | "loading" | "success">("idle");
    const [isHovered, setIsHovered] = useState(false);
    const [shake, setShake] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Validate form and calculate password strength
    useEffect(() => {
        if (status === "loading" || status === "success") return;

        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isNameValid = name.length > 2;
        const isPasswordValid = password.length >= 8;

        // Simple strength calculation
        let strength = 0;
        if (password.length > 4) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);

        setStatus(isEmailValid && isNameValid && isPasswordValid ? "valid" : "idle");
    }, [email, name, password, status]);

    const handleSubmit = async () => {
        if (status !== "valid") {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            return;
        }
        setStatus("loading");
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStatus("success");
    };

    const containerVariants: Variants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.23, 1, 0.32, 1],
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

    const getStrengthColor = (s: number) => {
        if (s === 0) return "bg-zinc-700";
        if (s <= 2) return "bg-red-500";
        if (s === 3) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ willChange: "transform, opacity" }}
            className="w-full max-w-[1100px] relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Obsidian Glass Card */}
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl ring-1 ring-white/5">
                {/* Top Highlight */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                <div className="p-12 relative z-10 flex flex-col items-center">
                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center text-center mb-8 max-w-md w-full">
                        <div className="w-12 h-12 bg-zinc-900 rounded-xl border border-white/10 flex items-center justify-center mb-6 shadow-lg group">
                            <User className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Join the Collective</h1>
                        <p className="text-zinc-400 text-sm">Create your account to start building.</p>
                    </motion.div>

                    {/* Inputs */}
                    <motion.div variants={itemVariants} className="w-full max-w-md space-y-4 mb-6 relative group/input">
                        <motion.div
                            animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}}
                            transition={{ duration: 0.4 }}
                            className="space-y-4"
                        >
                            {/* Name Input */}
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Full Name"
                                    disabled={status === "loading" || status === "success"}
                                    className="w-full h-12 bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 
                                             text-white placeholder:text-zinc-600 font-mono text-sm 
                                             outline-none transition-all duration-300
                                             focus:border-blue-500/50 focus:bg-zinc-900/80 focus:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]"
                                />
                            </div>

                            {/* Email Input */}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email Address"
                                    disabled={status === "loading" || status === "success"}
                                    className="w-full h-12 bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 
                                             text-white placeholder:text-zinc-600 font-mono text-sm 
                                             outline-none transition-all duration-300
                                             focus:border-blue-500/50 focus:bg-zinc-900/80 focus:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                                    placeholder="Password"
                                    disabled={status === "loading" || status === "success"}
                                    className="w-full h-12 bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 
                                             text-white placeholder:text-zinc-600 font-mono text-sm 
                                             outline-none transition-all duration-300
                                             focus:border-blue-500/50 focus:bg-zinc-900/80 focus:shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]"
                                />
                            </div>

                            {/* Password Strength Meter */}
                            <div className="flex gap-1 h-1 w-full px-1">
                                {[1, 2, 3, 4].map((level) => (
                                    <div
                                        key={level}
                                        className={`flex-1 rounded-full transition-colors duration-300 ${passwordStrength >= level ? getStrengthColor(passwordStrength) : "bg-zinc-800"
                                            }`}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {/* Submit Button */}
                        <motion.button
                            onClick={handleSubmit}
                            whileHover={status === "valid" ? { scale: 1.02 } : {}}
                            whileTap={status === "valid" ? { scale: 0.98 } : {}}
                            disabled={status !== "valid"}
                            className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all duration-300 ${status === "valid"
                                ? "bg-blue-600 text-white shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] hover:bg-blue-500"
                                : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                }`}
                        >
                            {status === "loading" ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : status === "success" ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <>
                                    Create Account <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>

                    {/* Divider */}
                    <motion.div variants={itemVariants} className="w-full max-w-md flex items-center gap-4 mb-6">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">Or join with</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </motion.div>

                    {/* Social Grid */}
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 mb-8 w-full max-w-md">
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
                        Already have an account? <a href="/login" className="text-zinc-400 hover:text-white transition-colors underline underline-offset-4">Log in</a>
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
