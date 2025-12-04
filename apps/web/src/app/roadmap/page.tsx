"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Search,
    FileText,
    Zap,
    Check,
    Layers,
    Sparkles,
    Target,
    Rocket
} from "lucide-react";
import { GridBackground } from "@/components/shared/GridBackground";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/landing/Navbar";

// Enhanced animation variants with spring physics
const springConfig = { stiffness: 100, damping: 15 };

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring" as const, ...springConfig }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

// Floating element component for parallax effect
const FloatingElement = ({
    className,
    delay = 0,
    duration = 20
}: {
    className: string;
    delay?: number;
    duration?: number;
}) => (
    <motion.div
        className={className}
        animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            rotate: [0, 5, -5, 0],
        }}
        transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

// Animated gradient orb component
const GradientOrb = ({
    color,
    size,
    position,
    delay = 0
}: {
    color: string;
    size: string;
    position: string;
    delay?: number;
}) => (
    <motion.div
        className={`absolute ${position} ${size} rounded-full ${color} blur-3xl opacity-30`}
        animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
        }}
        transition={{
            duration: 25,
            delay,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
);

// Mouse spotlight effect hook
const useMouseSpotlight = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
    };

    return { mouseX, mouseY, handleMouseMove };
};

// Enhanced Phase card component with glassmorphism 2.0
const PhaseCard = ({
    icon: Icon,
    title,
    description,
    color,
    delay = 0
}: {
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
    delay?: number;
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const { mouseX, mouseY, handleMouseMove } = useMouseSpotlight();

    return (
        <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay
            }}
            className="relative group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Animated gradient border */}
            <motion.div
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #10b981, #3b82f6)",
                    backgroundSize: "400% 400%",
                }}
                animate={{
                    backgroundPosition: isHovered ? ["0% 50%", "100% 50%", "0% 50%"] : "0% 50%"
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Glow effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-500`} />

            {/* Card content */}
            <div className="relative bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:border-white/20 transition-all duration-300 overflow-hidden">
                {/* Mouse spotlight effect */}
                <motion.div
                    className="absolute pointer-events-none w-64 h-64 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                        x: mouseX,
                        y: mouseY,
                        translateX: "-50%",
                        translateY: "-50%",
                    }}
                />

                {/* Icon with enhanced animation */}
                <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 relative z-10`}
                    whileHover={{
                        scale: 1.15,
                        rotate: [0, -10, 10, 0],
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                    <Icon className="w-6 h-6 text-white" />
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-2 relative z-10">{title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed relative z-10">{description}</p>
            </div>
        </motion.div>
    );
};

// Progress bar component for current milestone
const ProgressBar = ({ completed, total }: { completed: number; total: number }) => {
    const percentage = (completed / total) * 100;

    return (
        <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-zinc-400">Progress</span>
                <span className="text-xs font-bold text-blue-400">{completed}/{total} completed</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{
                        background: "linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)",
                        backgroundSize: "200% 100%",
                    }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                >
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        animate={{ x: ["-100%", "100%"] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

// Enhanced Roadmap milestone component with path drawing
const RoadmapMilestone = ({
    quarter,
    title,
    emoji,
    items,
    status,
    index
}: {
    quarter: string;
    title: string;
    emoji: string;
    items: { text: string; done?: boolean }[];
    status: "current" | "upcoming";
    index: number;
}) => {
    const isCurrent = status === "current";
    const completedCount = items.filter(item => item.done).length;

    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                type: "spring",
                stiffness: 80,
                damping: 20,
                delay: index * 0.15
            }}
            className="relative"
        >
            {/* Animated Timeline connector with path drawing effect */}
            <motion.div
                className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 overflow-hidden"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
            >
                <motion.div
                    className={`w-full h-full ${isCurrent
                        ? 'bg-gradient-to-b from-blue-500 via-purple-500 to-transparent'
                        : 'bg-gradient-to-b from-white/20 to-transparent'
                        }`}
                    initial={{ scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    style={{ transformOrigin: "top" }}
                />
            </motion.div>

            <div className={`relative md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                {/* Enhanced Timeline dot */}
                <motion.div
                    className={`hidden md:flex absolute top-8 ${index % 2 === 0 ? '-right-4' : '-left-4'} w-8 h-8 rounded-full border-2 items-center justify-center z-10 ${isCurrent
                        ? 'bg-blue-500 border-blue-400'
                        : 'bg-zinc-800 border-zinc-600'
                        }`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", stiffness: 200, delay: index * 0.2 + 0.3 }}
                >
                    {isCurrent ? (
                        <>
                            {/* Pulsing ring effect */}
                            <motion.div
                                className="absolute inset-0 rounded-full border-2 border-blue-400"
                                animate={{ scale: [1, 1.5, 1.5], opacity: [0.8, 0, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-3 h-3 bg-white rounded-full shadow-lg shadow-blue-500/50"
                            />
                        </>
                    ) : (
                        <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                    )}
                </motion.div>

                {/* Enhanced Card with glassmorphism */}
                <motion.div
                    className={`relative group overflow-hidden rounded-2xl border transition-all duration-500 ${isCurrent
                        ? 'bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent border-blue-500/30 hover:border-blue-400/60'
                        : 'bg-zinc-900/50 border-white/10 hover:border-white/25'
                        }`}
                    whileHover={{ y: -5, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    {/* Animated gradient border for current */}
                    {isCurrent && (
                        <motion.div
                            className="absolute -inset-0.5 rounded-2xl opacity-50"
                            style={{
                                background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6)",
                            }}
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        />
                    )}

                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    />

                    <div className={`relative p-6 ${isCurrent ? 'bg-zinc-900/80 backdrop-blur-xl rounded-2xl m-0.5' : ''}`}>
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <motion.span
                                className="text-2xl"
                                whileHover={{ scale: 1.3, rotate: [0, -15, 15, 0] }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {emoji}
                            </motion.span>
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-400' : 'text-zinc-500'
                                    }`}>
                                    {quarter}
                                </span>
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                            </div>
                            {isCurrent && (
                                <motion.span
                                    className="ml-auto px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-400 uppercase"
                                    animate={{
                                        boxShadow: ["0 0 0 0 rgba(59, 130, 246, 0.4)", "0 0 0 10px rgba(59, 130, 246, 0)", "0 0 0 0 rgba(59, 130, 246, 0)"]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    In Progress
                                </motion.span>
                            )}
                        </div>

                        {/* Items with staggered animation */}
                        <motion.ul
                            className="space-y-3"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={staggerContainer}
                        >
                            {items.map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex items-start gap-3"
                                    variants={fadeInUp}
                                >
                                    <motion.div
                                        className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-zinc-800 text-zinc-500'
                                            }`}
                                        whileHover={{ scale: 1.2 }}
                                    >
                                        {item.done ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                        )}
                                    </motion.div>
                                    <span className={`${item.done ? 'text-zinc-300' : 'text-zinc-400'} transition-colors`}>
                                        {item.text}
                                    </span>
                                </motion.li>
                            ))}
                        </motion.ul>

                        {/* Progress bar for current milestone */}
                        {isCurrent && <ProgressBar completed={completedCount} total={items.length} />}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Sticky section header component
const StickyHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <motion.div
        className={`sticky top-16 z-30 py-4 ${className}`}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
    >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl -z-10" />
        {children}
    </motion.div>
);

// Gradient text component for highlighting
const GradientText = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 ${className}`}>
        {children}
    </span>
);

export default function RoadmapPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.5]);

    const phases = [
        {
            icon: Search,
            title: "Deep-Dive Interrogation",
            description: "Our AI Analyst asks 10-30 strategic questions to uncover domain complexity, business logic, and edge cases. No more \"build me an Uber\" vagueness.",
            color: "from-blue-500/30 to-blue-600/20"
        },
        {
            icon: FileText,
            title: "Blueprint Suite Generation",
            description: "The Architect generates 6 comprehensive PRDs: Design System, Frontend, Backend, Security, Database, and MVP Feature List.",
            color: "from-purple-500/30 to-purple-600/20"
        },
        {
            icon: Zap,
            title: "Component-Driven Prompts",
            description: "No monolithic prompts. Our Engineering Manager outputs implementation prompts one-by-one, component-by-component.",
            color: "from-green-500/30 to-green-600/20"
        }
    ];

    const roadmapItems = [
        {
            quarter: "Q1 2026",
            title: "Foundation",
            emoji: "🏗️",
            status: "current" as const,
            items: [
                { text: "Deep-Dive Interrogation Engine (10-30 questions)", done: true },
                { text: "Scope Rationalization (\"Is this MVP or fluff?\")", done: true },
                { text: "Blueprint Suite Generation (6 PRDs)", done: true },
                { text: "Beta Launch for Waitlist Users", done: false },
                { text: "Workspace UI with Live Markdown Preview", done: false }
            ]
        },
        {
            quarter: "Q2 2026",
            title: "Intelligence",
            emoji: "🧠",
            status: "upcoming" as const,
            items: [
                { text: "Multi-model AI Support (Claude, GPT-4, Gemini)" },
                { text: "Context Memory (Learn from your patterns)" },
                { text: "Template Library (Pre-built interrogation flows)" },
                { text: "Team Collaboration (Shared projects)" },
                { text: "Export to Notion, Confluence, GitHub" }
            ]
        },
        {
            quarter: "Q3 2026",
            title: "Integration",
            emoji: "🔗",
            status: "upcoming" as const,
            items: [
                { text: "Direct GitHub Integration" },
                { text: "VS Code Extension" },
                { text: "Cursor IDE Plugin" },
                { text: "Automated Code Review" },
                { text: "CI/CD Pipeline Templates" }
            ]
        }
    ];

    return (
        <main ref={containerRef} className="min-h-screen bg-black text-white relative overflow-hidden">
            <GridBackground />

            {/* Animated Mesh Gradient Orbs */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <GradientOrb
                    color="bg-blue-600"
                    size="w-96 h-96"
                    position="top-20 -left-48"
                    delay={0}
                />
                <GradientOrb
                    color="bg-purple-600"
                    size="w-80 h-80"
                    position="top-1/3 -right-40"
                    delay={5}
                />
                <GradientOrb
                    color="bg-cyan-600"
                    size="w-72 h-72"
                    position="bottom-20 left-1/4"
                    delay={10}
                />
            </div>

            {/* Progress bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 z-50 origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            <Navbar />

            {/* Hero Section with Parallax */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                {/* Floating elements for parallax */}
                <FloatingElement
                    className="absolute top-40 left-10 w-20 h-20 rounded-full border border-blue-500/30 opacity-30"
                    delay={0}
                    duration={15}
                />
                <FloatingElement
                    className="absolute top-60 right-20 w-16 h-16 rounded-lg border border-purple-500/30 opacity-20 rotate-45"
                    delay={5}
                    duration={20}
                />
                <FloatingElement
                    className="absolute bottom-20 left-1/4 w-12 h-12 rounded-full bg-gradient-to-br from-green-500/10 to-transparent"
                    delay={3}
                    duration={18}
                />

                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ y: heroY, opacity: heroOpacity }}
                        className="text-center max-w-4xl mx-auto relative z-10"
                    >
                        <motion.div
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-400 mb-8"
                            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Rocket className="w-4 h-4" />
                            </motion.div>
                            <span className="tracking-wide">The Future of AI-Powered Development</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
                            <motion.span
                                className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-400 block"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Stop Hallucinating.
                            </motion.span>
                            <motion.span
                                className="text-zinc-500 block"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                Start Building Right.
                            </motion.span>
                        </h1>

                        <motion.p
                            className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            The Architect is a <GradientText className="font-semibold">Production-Grade Interrogation Engine</GradientText> that
                            prevents vibe coding. Deep-dive interrogation. Bulletproof specs. Component-driven implementation.
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row items-center justify-center gap-4"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Link href="/waitlist">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="default" className="h-12 px-8 text-lg group relative overflow-hidden">
                                        <span className="relative z-10 flex items-center">
                                            Join the Waitlist
                                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link href="#how-it-works">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                                    <Button variant="ghost" className="h-12 px-8 text-lg text-zinc-400 hover:text-white">
                                        See How It Works
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-24 border-t border-white/5">
                {/* Section-specific ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <StickyHeader>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                                How The Architect Works
                            </h2>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                Three phases. Zero hallucinations. <GradientText>Production-ready blueprints.</GradientText>
                            </p>
                        </motion.div>
                    </StickyHeader>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">
                        {phases.map((phase, i) => (
                            <PhaseCard key={i} {...phase} delay={i * 0.15} />
                        ))}
                    </div>

                    {/* Enhanced Workflow visualization */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 flex items-center justify-center gap-4 flex-wrap"
                    >
                        {[
                            { icon: Target, color: "text-blue-400", label: "Raw Idea" },
                            { icon: Search, color: "text-purple-400", label: "10-30 Questions" },
                            { icon: Layers, color: "text-green-400", label: "6 PRDs" },
                            { icon: Sparkles, color: "text-yellow-400", label: "Production Code" }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex items-center gap-3"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <motion.div
                                    className="flex items-center gap-3 px-4 py-2 bg-zinc-900/80 backdrop-blur border border-white/10 rounded-full"
                                    whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
                                >
                                    <item.icon className={`w-4 h-4 ${item.color}`} />
                                    <span className="text-sm text-zinc-300">{item.label}</span>
                                </motion.div>
                                {i < 3 && (
                                    <motion.div
                                        animate={{ x: [0, 5, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                                    >
                                        <ArrowRight className="w-5 h-5 text-zinc-600" />
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="relative py-24 border-t border-white/5">
                {/* Section-specific ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
                    </div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <StickyHeader>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center"
                        >
                            <motion.div
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-4"
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Sparkles className="w-4 h-4" />
                                </motion.div>
                                <span className="tracking-wide">Product Roadmap</span>
                            </motion.div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-2 tracking-tight">
                                What We&apos;re Building
                            </h2>
                            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                                Our vision for <GradientText>revolutionizing</GradientText> how developers build software with AI.
                            </p>
                        </motion.div>
                    </StickyHeader>

                    {/* Timeline with enhanced visuals */}
                    <div className="max-w-4xl mx-auto space-y-8 mt-8">
                        {roadmapItems.map((item, i) => (
                            <RoadmapMilestone key={i} {...item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 border-t border-white/5">
                {/* Section-specific ambient glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-full blur-3xl" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative max-w-3xl mx-auto text-center"
                    >
                        <motion.div
                            className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12 overflow-hidden"
                            whileHover={{ borderColor: "rgba(255,255,255,0.2)" }}
                        >
                            {/* Animated border gradient */}
                            <motion.div
                                className="absolute -inset-0.5 rounded-3xl opacity-30"
                                style={{
                                    background: "conic-gradient(from 0deg, #3b82f6, #8b5cf6, #10b981, #3b82f6)",
                                }}
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            />

                            {/* Content */}
                            <div className="relative z-10 bg-zinc-900/90 rounded-3xl p-8 -m-4">
                                <motion.h2
                                    className="text-3xl md:text-4xl font-bold mb-4 tracking-tight"
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                >
                                    Ready to <GradientText>Stop Hallucinating</GradientText>?
                                </motion.h2>
                                <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                                    Join the waitlist and be among the first to experience production-grade AI development.
                                </p>
                                <Link href="/waitlist">
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="inline-block"
                                    >
                                        <Button variant="default" className="h-14 px-10 text-lg group relative overflow-hidden">
                                            <span className="relative z-10 flex items-center">
                                                Join the Waitlist
                                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </Button>
                                    </motion.div>
                                </Link>
                                <motion.p
                                    className="mt-6 text-sm text-zinc-500"
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Early access • No credit card required • Be part of the revolution
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-8">
                <div className="container mx-auto px-4 text-center text-zinc-500 text-sm">
                    <p>© 2025 The Architect. Building the future of AI-powered development.</p>
                </div>
            </footer>
        </main>
    );
}
