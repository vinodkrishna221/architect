"use client";

import { AlertTriangle, FileCode, HelpCircle, X, ArrowRight, LucideIcon } from "lucide-react";
import { Spotlight } from "@/components/ui/Spotlight";
import { motion } from "framer-motion";
import { useState, ReactNode } from "react";
import { GarbageCodeVisual } from "./problem-visuals/GarbageCodeVisual";
import { HallucinationVisual } from "./problem-visuals/HallucinationVisual";
import { DoomLoopVisual } from "./problem-visuals/DoomLoopVisual";

interface ProblemCardData {
    id: number;
    title: string;
    description: string;
    icon: LucideIcon;
    visual: ReactNode;
}

const PROBLEM_CARDS: ProblemCardData[] = [
    {
        id: 0,
        title: "Garbage In, Garbage Out",
        description: "One-shot prompts generate spaghetti code that breaks immediately",
        icon: FileCode,
        visual: <GarbageCodeVisual />
    },
    {
        id: 1,
        title: "Missing Context",
        description: "AI hallucinates features and forgets security (Auth, RLS, Payments)",
        icon: HelpCircle,
        visual: <HallucinationVisual />
    },
    {
        id: 2,
        title: "No Critic Loop",
        description: "No one asks \"How does this work?\" before generating 2,000 lines",
        icon: AlertTriangle,
        visual: <DoomLoopVisual />
    }
];

export default function ProblemSection() {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <section className="py-32 relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-zinc-100"
                    >
                        The Vibe Coding Trap
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ margin: "-100px" }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-zinc-400 text-lg max-w-2xl mx-auto"
                    >
                        Why most "AI-generated" apps fail to reach production.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {PROBLEM_CARDS.map((card, index) => (
                        <motion.div
                            key={card.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{
                                opacity: 1,
                                y: 0,
                                transition: { duration: 0.8, delay: 0.2 + (index * 0.2) }
                            }}
                            viewport={{ margin: "-100px" }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            whileHover={{
                                x: [0, -2, 2, -1, 0],
                                transition: { repeat: Infinity, duration: 0.2 }
                            }}
                            animate={{
                                scale: hoveredIndex === index ? 1.02 : hoveredIndex !== null ? 0.98 : 1,
                                opacity: hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1,
                            }}
                        >
                            <Spotlight className="p-8 flex flex-col items-center text-center group h-full shadow-[0_0_30px_-10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_40px_-5px_rgba(239,68,68,0.3)] transition-shadow duration-300">
                                <div className="w-12 h-12 border border-white/10 rounded-lg flex items-center justify-center mb-6 bg-white/5 group-hover:bg-red-500/10 group-hover:border-red-500/20 transition-all duration-300">
                                    <card.icon className="w-6 h-6 text-zinc-400 group-hover:text-red-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-zinc-100 group-hover:text-red-100 transition-colors">{card.title}</h3>
                                <p className="text-zinc-400 mb-8 text-sm leading-relaxed">
                                    {card.description}
                                </p>
                                {card.visual}
                            </Spotlight>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
