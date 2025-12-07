"use client";

import { motion } from "framer-motion";
import { GridBackground } from "@/components/shared/GridBackground";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
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
                                Our Mission:
                            </span>
                            <br />
                            <span className="text-blue-500">
                                End Hallucinations
                            </span>
                        </h1>
                        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            We believe that AI coding should be deterministic, precise, and architecturally sound. We're building the tools to make that a reality.
                        </p>
                    </motion.div>
                </section>

                {/* Story Section */}
                <section className="container mx-auto px-4 mb-32">
                    <div className="max-w-4xl mx-auto bg-zinc-900/50 backdrop-blur border border-white/10 rounded-3xl p-8 md:p-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl font-bold mb-6">Why The Architect?</h2>
                            <div className="space-y-6 text-zinc-400 text-lg leading-relaxed">
                                <p>
                                    Generative AI has transformed how we write code, but it has a fatal flaw: <strong>Hallucinations</strong>.
                                    Looking for a quick script? AI is great. Building a complex, scalable system? "Vibe coding" leads to technical debt, security vulnerabilities, and unmaintainable spaghetti code.
                                </p>
                                <p>
                                    The Architect wasn't built to just "write code". It was built to <strong>think</strong> like a Principal Engineer.
                                    It asks the hard questions. It demands clarity. It plans before it executes.
                                </p>
                                <p>
                                    We are a team of engineers, designers, and researchers dedicated to bringing <strong>engineering rigor</strong> to the AI age.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="container mx-auto px-4 mb-32">
                    <div className="max-w-5xl mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Core Values</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Precision",
                                    description: "Ambiguity is the enemy. We value precise specifications and deterministic outputs over creative guesses."
                                },
                                {
                                    title: "Control",
                                    description: "The developer should always be in the driver's seat. AI is the engine, not the steering wheel."
                                },
                                {
                                    title: "Efficiency",
                                    description: "Time spent debugging hallucinations is time wasted. We optimize for the shortest path to production-ready code."
                                }
                            ].map((value, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="text-center p-6 border border-white/5 rounded-2xl bg-zinc-900/30"
                                >
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                                    <p className="text-zinc-400">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-8">Join the Revolution</h2>
                    <Link href="/waitlist">
                        <Button size="lg" className="h-14 px-10 text-lg">
                            Get Early Access <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </section>
            </main>

            <Footer />
        </div>
    );
}
