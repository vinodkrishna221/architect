"use client";

import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Spotlight } from "@/components/ui/Spotlight";
import { TiltCard } from "@/components/ui/TiltCard";
import { AmbiguityCheckVisual } from "./solution-visuals/AmbiguityCheckVisual";
import { StructuredContextVisual } from "./solution-visuals/StructuredContextVisual";
import { SplitArtifactVisual } from "./solution-visuals/SplitArtifactVisual";

interface SolutionStepData {
    id: number;
    stepNumber: string;
    title: string;
    description: ReactNode;
    color: "blue" | "purple" | "white";
    visual: ReactNode;
}

const SOLUTION_STEPS: SolutionStepData[] = [
    {
        id: 0,
        stepNumber: "01",
        title: "The Ambiguity Check",
        description: (
            <>
                You enter a raw idea. Our <strong>Critic AI</strong> analyzes it specifically to find technical holes, generating 3-5 ruthless questions.
            </>
        ),
        color: "blue",
        visual: <AmbiguityCheckVisual />
    },
    {
        id: 1,
        stepNumber: "02",
        title: "The Structured Context",
        description: (
            <>
                We combine your original idea with your technical answers to create a <strong>Context Object</strong>—a single source of truth.
            </>
        ),
        color: "purple",
        visual: <StructuredContextVisual />
    },
    {
        id: 2,
        stepNumber: "03",
        title: "The Split-Artifact Generation",
        description: (
            <>
                Our <strong>Architect AI</strong> forces separation of concerns. It generates two distinct blueprints: <code>backend.md</code> and <code>frontend.md</code>.
            </>
        ),
        color: "white",
        visual: <SplitArtifactVisual />
    }
];

export default function SolutionSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"],
    });

    // Path drawing animation
    const pathLength = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

    return (
        <section ref={containerRef} className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-4 relative">

                {/* Section Header */}
                <div className="text-center mb-32 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-100"
                    >
                        The Interrogation Protocol
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        We don't generate code immediately. We force you through a ruthless "Critic" loop first.
                    </motion.p>
                </div>

                {/* The Circuit Timeline */}
                <div className="relative max-w-4xl mx-auto">

                    {/* Central Digital Thread (SVG) */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 z-0 hidden md:block">
                        <svg className="h-full w-full overflow-visible" preserveAspectRatio="none">
                            <motion.path
                                d="M 0 0 V 1200" // Straight line down
                                stroke="url(#gradient)"
                                strokeWidth="2"
                                fill="none"
                                style={{ pathLength }}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                    <stop offset="10%" stopColor="#3b82f6" />
                                    <stop offset="50%" stopColor="#a855f7" />
                                    <stop offset="90%" stopColor="#a855f7" />
                                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {SOLUTION_STEPS.map((step, index) => {
                        const isEven = index % 2 === 0;
                        const colorClass = step.color === "blue" ? "text-blue-400" : step.color === "purple" ? "text-purple-400" : "text-zinc-100";
                        const bgClass = step.color === "blue" ? "bg-blue-500" : step.color === "purple" ? "bg-purple-500" : "bg-white";
                        const gradientTitle = step.color === "blue"
                            ? "from-blue-400 to-blue-100"
                            : step.color === "purple"
                                ? "from-purple-400 to-purple-100"
                                : "from-zinc-100 to-zinc-400";

                        const shadowClass = step.color === "blue"
                            ? "shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
                            : step.color === "purple"
                                ? "shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]"
                                : "shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]";

                        return (
                            <div key={step.id} className={`relative z-10 grid md:grid-cols-2 gap-12 items-center ${index !== SOLUTION_STEPS.length - 1 ? 'mb-32' : ''}`}>
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: false, margin: "-100px" }}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        visible: {
                                            opacity: 1,
                                            y: 0,
                                            transition: {
                                                staggerChildren: 0.1,
                                                duration: 0.8,
                                                ease: "easeOut"
                                            }
                                        }
                                    }}
                                    className={`${isEven ? 'order-2 md:order-1 text-right pr-8' : 'order-2 md:order-2 pl-8'} relative`}
                                >
                                    {/* Giant Watermark Numeral */}
                                    <div className={`absolute -top-20 ${isEven ? '-right-10' : '-left-10'} text-9xl font-bold opacity-[0.03] select-none pointer-events-none`}>
                                        {step.stepNumber}
                                    </div>

                                    <motion.div
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                        className={`inline-flex items-center gap-2 mb-2 ${colorClass} font-mono text-xs uppercase tracking-widest`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${bgClass} animate-pulse`} />
                                        Step {step.stepNumber}
                                    </motion.div>

                                    <motion.h3
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                        className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradientTitle} mb-4`}
                                    >
                                        {step.title}
                                    </motion.h3>

                                    <motion.p
                                        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                        className="text-zinc-400 leading-relaxed"
                                    >
                                        {step.description}
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: false, margin: "-100px" }}
                                    transition={{ duration: 0.5 }}
                                    className={`${isEven ? 'order-1 md:order-2 pl-8' : 'order-1 md:order-1 pr-8'} relative`}
                                >
                                    <Spotlight className={`p-6 bg-zinc-900/50 backdrop-blur-sm border border-white/10 rounded-xl relative ${shadowClass}`}>
                                        {/* Active Pulse Timeline Node */}
                                        <motion.div
                                            initial={{ scale: 1, boxShadow: "0 0 0 0 rgba(0,0,0,0)" }}
                                            whileInView={{
                                                scale: 1.5,
                                                boxShadow: `0 0 20px 2px ${step.color === 'blue' ? 'rgba(59,130,246,0.5)' : step.color === 'purple' ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.5)'}`
                                            }}
                                            viewport={{ margin: "-50% 0px -50% 0px" }}
                                            transition={{ duration: 0.5 }}
                                            className={`absolute ${isEven ? '-left-11' : '-right-11'} top-1/2 -translate-y-1/2 w-3 h-3 ${bgClass} rounded-full border-4 border-zinc-950 hidden md:block z-20`}
                                        />
                                        <TiltCard>
                                            {step.visual}
                                        </TiltCard>
                                    </Spotlight>
                                </motion.div>
                            </div>
                        );
                    })}

                </div >
            </div >
        </section >
    );
}
