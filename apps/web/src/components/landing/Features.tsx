"use client";

import { Container } from "@/components/ui/Container";
import { motion } from "framer-motion";
import { ScanSearch, FileCode, Zap } from "lucide-react";

const features = [
    {
        title: "Ambiguity Detection",
        description: "Identify vague requirements instantly. Our AI scans your inputs and flags potential misunderstandings before code is written.",
        icon: ScanSearch,
    },
    {
        title: "Smart Blueprints",
        description: "Generate comprehensive technical specifications. From database schemas to API endpoints, get a complete roadmap.",
        icon: FileCode,
    },
    {
        title: "Instant Execution",
        description: "Move from plan to code in seconds. Export your blueprints directly to your development environment.",
        icon: Zap,
    },
];

export default function Features() {
    return (
        <section className="py-24 bg-zinc-950 border-b border-zinc-800">
            <Container>
                <div className="mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                        System Capabilities
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl">
                        Designed for engineering teams who demand accuracy and speed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="p-8 rounded-lg border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
                        >
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center mb-6 text-white">
                                <feature.icon size={24} />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-zinc-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    );
}
