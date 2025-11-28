"use client";

import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Database, X } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { GridBackground } from "./GridBackground";

const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (index < text.length) {
            const timer = setTimeout(() => {
                setDisplayedText((prev) => prev + text.charAt(index));
                setIndex(index + 1);
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [index, text]);

    return (
        <span>
            {displayedText}
            <motion.span
                animate={{ opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-[3px] h-[1em] bg-blue-500 ml-1 align-middle"
            />
        </span>
    );
};

export default function Hero() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollY } = useScroll();

    // Parallax Tilt for Stack
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set((clientX / innerWidth - 0.5) * 10); // Tilt range
        mouseY.set((clientY / innerHeight - 0.5) * 10);
    };

    const opacity = useTransform(scrollY, [0, 300], [1, 0]);
    const scale = useTransform(scrollY, [0, 300], [1, 0.95]);
    const y = useTransform(scrollY, [0, 300], [0, 50]);

    return (
        <section
            ref={containerRef}
            className="relative min-h-screen flex items-center justify-center pt-10 overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            <GridBackground />

            <motion.div
                style={{ opacity, scale, y }}
                className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10"
            >
                {/* Left Content */}
                <div className="max-w-2xl z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
                    >
                        <TypewriterText text="Stop hallucinating code." /> <br />
                        Start <span className="text-zinc-400">building right.</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                        className="text-xl text-zinc-400 mb-8 leading-relaxed max-w-lg"
                    >
                        Generate bulletproof technical blueprints before writing a single line.
                        The Architect interrogates your idea, catches gaps, and creates perfect specs for your AI coding agent.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                    >
                        <Button variant="primary" className="h-12 px-8 text-lg rounded-lg group">
                            Interrogate My Idea
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </motion.div>
                </div>

                {/* Right Visual - Isometric Stack */}
                <motion.div
                    className="relative h-[600px] w-full hidden lg:block perspective-[2000px]"
                    style={{ rotateX: springY, rotateY: springX }}
                >
                    <div className="absolute inset-0 flex items-center justify-center transform scale-[0.85] translate-y-10">

                        {/* Card 1: Input - Raw Idea (Top Left) */}
                        <motion.div
                            initial={{ x: -50, opacity: 0 }}
                            animate={{
                                x: 0,
                                opacity: 1,
                                y: [-5, 5, -5]
                            }}
                            transition={{
                                delay: 0.2,
                                duration: 1.2,
                                ease: "easeOut",
                                y: { repeat: Infinity, duration: 6, ease: "easeInOut" }
                            }}
                            className="absolute top-0 left-10 w-72 bg-zinc-900/80 backdrop-blur-md rounded-xl shadow-2xl border border-white/10 overflow-hidden z-20 group"
                            style={{ transform: "rotate(5deg)" }}
                        >
                            {/* Glass Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                            <div className="bg-black/50 p-2 flex items-center gap-1.5 pl-4 border-b border-white/5">
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
                            </div>
                            <div className="p-4 pt-8 pb-8">
                                <div className="absolute top-3 right-3 bg-blue-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-blue-400 uppercase tracking-wider border border-blue-500/20">
                                    Input - Raw Idea
                                </div>
                                <p className="font-mono text-sm text-zinc-300">
                                    Build me an Uber for Dog Walkers<span className="animate-pulse text-blue-500">|</span>
                                </p>
                            </div>
                        </motion.div>

                        {/* Card 2: The Critic - Ambiguity Check (Top Right) */}
                        <motion.div
                            initial={{ x: 50, opacity: 0 }}
                            animate={{
                                x: 0,
                                opacity: 1,
                                y: [5, -5, 5]
                            }}
                            transition={{
                                delay: 0.4,
                                duration: 1.2,
                                ease: "easeOut",
                                y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1 }
                            }}
                            className="absolute top-10 right-0 w-72 bg-zinc-900 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-10 group"
                            style={{
                                transform: "rotate(-8deg)",
                            }}
                        >
                            {/* Glass Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                            <div className="p-5 relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-purple-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-purple-400 uppercase tracking-wider border border-purple-500/20">
                                        The Critic
                                    </div>
                                    <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400 font-bold text-xs border border-purple-500/20">!</div>
                                </div>
                                <div className="space-y-2 font-medium text-sm text-zinc-400">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-purple-500/20 rounded-sm flex items-center justify-center bg-purple-500/5">
                                            <div className="w-2 h-2 bg-purple-500 rounded-[1px]" />
                                        </div>
                                        What's your auth strategy?
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-purple-500/20 rounded-sm flex items-center justify-center bg-purple-500/5">
                                            <div className="w-2 h-2 bg-purple-500 rounded-[1px]" />
                                        </div>
                                        How do you handle payments?
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border border-purple-500/20 rounded-sm flex items-center justify-center bg-purple-500/5">
                                            <div className="w-2 h-2 bg-purple-500 rounded-[1px]" />
                                        </div>
                                        Need an admin panel?
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 3: Context Built (Middle) */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{
                                y: [0, -8, 0],
                                opacity: 1
                            }}
                            transition={{
                                delay: 0.6,
                                duration: 1.2,
                                ease: "easeOut",
                                y: { repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.5 }
                            }}
                            className="absolute top-48 left-20 w-64 bg-zinc-900 rounded-xl shadow-2xl border border-white/10 z-30 overflow-hidden group"
                            style={{ transform: "rotate(0deg)" }}
                        >
                            {/* Glass Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                            <div className="bg-black/40 p-3 border-b border-white/5 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Context Architecture</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                </div>
                            </div>
                            <div className="p-6 flex justify-center items-center bg-zinc-900/50 h-40 relative">
                                {/* Isometric Stack Illustration */}
                                <div className="relative w-32 h-32 transform scale-75">
                                    {/* Bottom Layer (Database) */}
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-zinc-800 border border-white/10 rounded-lg z-10 flex items-center justify-center shadow-lg">
                                        <span className="text-[8px] font-mono text-zinc-500">DATA</span>
                                    </div>
                                    {/* Middle Layer (Logic) */}
                                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-zinc-800/80 border border-white/20 rounded-lg z-20 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                        <span className="text-[8px] font-mono text-zinc-400">LOGIC</span>
                                    </div>
                                    {/* Top Layer (Interface) */}
                                    <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 w-24 h-12 bg-zinc-100 border border-white rounded-lg z-30 flex items-center justify-center shadow-xl">
                                        <span className="text-[8px] font-mono font-bold text-black">INTERFACE</span>
                                    </div>
                                    {/* Connecting Lines */}
                                    <div className="absolute top-1/2 left-1/2 w-px h-24 bg-white/10 transform -translate-x-1/2 -translate-y-1/2 z-0" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Card 4: Blueprint Output (Bottom Right) */}
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{
                                y: [0, 6, 0],
                                opacity: 1
                            }}
                            transition={{
                                delay: 0.8,
                                duration: 1.2,
                                ease: "easeOut",
                                y: { repeat: Infinity, duration: 6.5, ease: "easeInOut", delay: 1.5 }
                            }}
                            className="absolute bottom-[-40px] right-[-20px] w-80 bg-zinc-900 rounded-xl shadow-2xl border border-white/10 z-40 overflow-hidden group"
                            style={{ transform: "rotate(3deg)" }}
                        >
                            {/* Glass Shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                            <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 transform rotate-45 translate-x-6 -translate-y-6" />

                            <div className="relative h-48 w-full flex">
                                {/* Diagonal Split Line */}
                                <div className="absolute inset-0 pointer-events-none">
                                    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                                    </svg>
                                </div>

                                {/* Top Left Content (Backend) */}
                                <div className="w-full h-full p-5 relative">
                                    <div className="absolute top-4 left-4 max-w-[50%]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20">
                                                <Database className="w-3 h-3 text-blue-400" />
                                            </div>
                                            <span className="font-mono text-xs font-bold text-zinc-300">backend.md</span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="h-1.5 w-24 bg-white/10 rounded-full" />
                                            <div className="h-1.5 w-16 bg-white/10 rounded-full" />
                                            <div className="h-1.5 w-20 bg-white/10 rounded-full" />
                                        </div>
                                    </div>

                                    {/* Bottom Right Content (Frontend) */}
                                    <div className="absolute bottom-4 right-4 max-w-[50%] text-right flex flex-col items-end">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="font-mono text-xs font-bold text-zinc-300">frontend.md</span>
                                            <div className="p-1 bg-purple-500/10 rounded border border-purple-500/20">
                                                <div className="w-3 h-3 text-purple-400 font-bold text-[10px] flex items-center justify-center">{`{}`}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 flex flex-col items-end">
                                            <div className="h-1.5 w-20 bg-white/10 rounded-full" />
                                            <div className="h-1.5 w-24 bg-white/10 rounded-full" />
                                            <div className="h-1.5 w-12 bg-white/10 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                    </div>
                </motion.div>
            </motion.div>
        </section>
    );
}
