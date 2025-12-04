"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import {
    ArrowRight,
    Search,
    FileText,
    Zap,
    Check,
    Brain,
    Users,
    Layers,
    Github,
    Code2,
    Sparkles,
    Target,
    Rocket
} from "lucide-react";
import { GridBackground } from "@/components/shared/GridBackground";
import { Button } from "@/components/ui/Button";
import Navbar from "@/components/landing/Navbar";

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15 }
    }
};

// Phase card component
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
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="relative group"
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 rounded-2xl blur-xl transition-opacity duration-500`} />
        <div className="relative bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full hover:border-white/20 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

// Roadmap milestone component
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

    return (
        <motion.div
            initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative"
        >
            {/* Timeline connector */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-white/20 to-transparent -translate-x-1/2" />

            <div className={`relative md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}>
                {/* Timeline dot */}
                <div className={`hidden md:flex absolute top-8 ${index % 2 === 0 ? '-right-4' : '-left-4'} w-8 h-8 rounded-full border-2 items-center justify-center z-10 ${isCurrent
                        ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                        : 'bg-zinc-800 border-zinc-600'
                    }`}>
                    {isCurrent ? (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-3 h-3 bg-white rounded-full"
                        />
                    ) : (
                        <div className="w-2 h-2 bg-zinc-500 rounded-full" />
                    )}
                </div>

                {/* Card */}
                <div className={`relative group overflow-hidden rounded-2xl border transition-all duration-300 ${isCurrent
                        ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30 hover:border-blue-400/50'
                        : 'bg-zinc-900/50 border-white/10 hover:border-white/20'
                    }`}>
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                    <div className="relative p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">{emoji}</span>
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-blue-400' : 'text-zinc-500'
                                    }`}>
                                    {quarter}
                                </span>
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                            </div>
                            {isCurrent && (
                                <span className="ml-auto px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-xs font-bold text-blue-400 uppercase">
                                    In Progress
                                </span>
                            )}
                        </div>

                        {/* Items */}
                        <ul className="space-y-3">
                            {items.map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {item.done ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <div className="w-1.5 h-1.5 bg-current rounded-full" />
                                        )}
                                    </div>
                                    <span className={item.done ? 'text-zinc-300' : 'text-zinc-400'}>
                                        {item.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function RoadmapPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    const phases = [
        {
            icon: Search,
            title: "Deep-Dive Interrogation",
            description: "Our AI Analyst asks 10-30 strategic questions to uncover domain complexity, business logic, and edge cases. No more \"build me an Uber\" vagueness.",
            color: "from-blue-500/20 to-blue-600/20"
        },
        {
            icon: FileText,
            title: "Blueprint Suite Generation",
            description: "The Architect generates 6 comprehensive PRDs: Design System, Frontend, Backend, Security, Database, and MVP Feature List.",
            color: "from-purple-500/20 to-purple-600/20"
        },
        {
            icon: Zap,
            title: "Component-Driven Prompts",
            description: "No monolithic prompts. Our Engineering Manager outputs implementation prompts one-by-one, component-by-component.",
            color: "from-green-500/20 to-green-600/20"
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
        <main ref={containerRef} className="min-h-screen bg-black text-white relative">
            <GridBackground />

            {/* Progress bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 z-50 origin-left"
                style={{ scaleX: scrollYProgress }}
            />

            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-zinc-400 mb-8">
                            <Rocket className="w-4 h-4" />
                            <span>The Future of AI-Powered Development</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                                Stop Hallucinating.
                            </span>
                            <br />
                            <span className="text-zinc-500">Start Building Right.</span>
                        </h1>

                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8 leading-relaxed">
                            The Architect is a <strong className="text-white">Production-Grade Interrogation Engine</strong> that
                            prevents vibe coding. Deep-dive interrogation. Bulletproof specs. Component-driven implementation.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/waitlist">
                                <Button variant="default" className="h-12 px-8 text-lg group">
                                    Join the Waitlist
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <Link href="#how-it-works">
                                <Button variant="ghost" className="h-12 px-8 text-lg text-zinc-400 hover:text-white">
                                    See How It Works
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-24 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            How The Architect Works
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            Three phases. Zero hallucinations. Production-ready blueprints.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {phases.map((phase, i) => (
                            <PhaseCard key={i} {...phase} delay={i * 0.15} />
                        ))}
                    </div>

                    {/* Workflow visualization */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-16 flex items-center justify-center gap-4 flex-wrap"
                    >
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-full">
                            <Target className="w-4 h-4 text-blue-400" />
                            <span className="text-sm text-zinc-300">Raw Idea</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-600" />
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-full">
                            <Search className="w-4 h-4 text-purple-400" />
                            <span className="text-sm text-zinc-300">10-30 Questions</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-600" />
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-full">
                            <Layers className="w-4 h-4 text-green-400" />
                            <span className="text-sm text-zinc-300">6 PRDs</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-zinc-600" />
                        <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 border border-white/10 rounded-full">
                            <Sparkles className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-zinc-300">Production Code</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="relative py-24 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400 mb-6">
                            <Sparkles className="w-4 h-4" />
                            <span>Product Roadmap</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            What We&apos;re Building
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            Our vision for revolutionizing how developers build software with AI.
                        </p>
                    </motion.div>

                    {/* Timeline */}
                    <div className="max-w-4xl mx-auto space-y-8">
                        {roadmapItems.map((item, i) => (
                            <RoadmapMilestone key={i} {...item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24 border-t border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative max-w-3xl mx-auto text-center"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 blur-3xl -z-10" />

                        <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Stop Hallucinating?
                            </h2>
                            <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
                                Join the waitlist and be among the first to experience production-grade AI development.
                            </p>
                            <Link href="/waitlist">
                                <Button variant="default" className="h-14 px-10 text-lg group">
                                    Join the Waitlist
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                            <p className="mt-6 text-sm text-zinc-500">
                                Early access • No credit card required • Be part of the revolution
                            </p>
                        </div>
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
