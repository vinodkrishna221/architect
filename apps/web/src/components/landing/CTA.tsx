"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { WarpBackground } from "./cta-visuals/WarpBackground";
import { TerminalOverlay } from "./cta-visuals/TerminalOverlay";
import { DecodedText } from "./cta-visuals/DecodedText";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticLink } from "@/components/ui/MagneticLink";

export default function CTA() {
    return (
        <section className="py-32 bg-black relative overflow-hidden group">
            {/* Visual Layers */}
            <WarpBackground />
            <TerminalOverlay />

            {/* Vignette & Spotlight Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none z-10" />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none z-10" />

            <Container className="text-center relative z-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                >
                    <h2 className="text-4xl md:text-7xl font-bold tracking-tighter text-white mb-8">
                        <DecodedText text="Ready to Architect?" />
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Join thousands of developers building better software with precision tools.
                        <br />
                        <span className="text-zinc-500 text-sm mt-2 block">No hallucinations. Just shipped code.</span>
                    </motion.p>

                    <div className="flex justify-center">
                        <MagneticLink href="#" className="relative group/btn">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            <Button size="lg" className="min-w-[240px] h-16 text-xl rounded-full relative overflow-hidden border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-xl transition-all duration-300 group-hover/btn:scale-105 group-hover/btn:border-blue-500/50 group-hover/btn:shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)] text-white">
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    Get Started Now
                                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                </span>
                                {/* Button Shine */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[200%] transition-transform duration-1000" />
                            </Button>
                        </MagneticLink>
                    </div>
                </motion.div>
            </Container>
        </section>
    );
}
