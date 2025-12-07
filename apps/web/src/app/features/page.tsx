"use client";

import { motion } from "framer-motion";
import { GridBackground } from "@/components/shared/GridBackground";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, Brain, Code, FileText, Layout, MessageSquare, Zap } from "lucide-react";

export default function FeaturesPage() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            <GridBackground />

            <Navbar />

            <main className="relative pt-32 pb-20">
                {/* Hero Section */}
                <section className="container mx-auto px-4 mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-400">
                                Features that
                            </span>
                            <br />
                            <span className="text-blue-500">
                                Redefine Development
                            </span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Stop wrestling with vague requirements. The Architect transforms your ideas into production-grade code through structured interrogation and precise specification.
                        </p>
                        <Link href="/waitlist">
                            <Button size="lg" className="h-12 px-8 text-lg">
                                Start Building <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto px-4 mb-32">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: MessageSquare,
                                title: "Deep-Dive Interrogation",
                                description: "Our AI Analyst asks 10-30 strategic questions to uncover domain complexity, business logic, and edge cases before a single line of code is written."
                            },
                            {
                                icon: FileText,
                                title: "Blueprint Suite Generation",
                                description: "Automatically generate comprehensive PRDs including Design System, Frontend, Backend, Security, Database, and MVP Feature Lists."
                            },
                            {
                                icon: Code,
                                title: "Component-Driven Prompts",
                                description: "Receive implementation prompts one-by-one, component-by-component. No more context-limit-breaking monolithic outputs."
                            },
                            {
                                icon: Brain,
                                title: "Context Memory",
                                description: "The Architect remembers your project decisions, style preferences, and architectural constraints across every interaction."
                            },
                            {
                                icon: Layout,
                                title: "Live Preview",
                                description: "See your PRDs and specifications come to life with a real-time markdown preview engine built directly into the workspace."
                            },
                            {
                                icon: Zap,
                                title: "Multi-Model Support",
                                description: "Seamlessly switch between Claude, GPT-4, and Gemini to leverage the best model for each specific task in the development lifecycle."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/50 backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition-colors group"
                            >
                                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                                    <feature.icon className="w-6 h-6 text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-4 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                                <p className="text-zinc-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4">
                    <div className="bg-gradient-to-br from-blue-900/20 via-zinc-900/50 to-zinc-900/20 border border-white/10 rounded-3xl p-12 text-center overflow-hidden relative">
                        <div className="absolute inset-0 bg-grid-white/5 bg-[size:32px_32px] [mask-image:radial-gradient(white,transparent_70%)] opacity-20" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl font-bold mb-6">Ready to stop hallucinating?</h2>
                            <p className="text-lg text-zinc-400 mb-8">
                                Join the waitlist today and be among the first to experience the future of AI-powered software development.
                            </p>
                            <Link href="/waitlist">
                                <Button size="lg" className="h-14 px-10 text-lg">
                                    Get Early Access
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
