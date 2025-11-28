"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { BlackHoleVisual } from "./cta-visuals/BlackHoleVisual";
import { TerminalOverlay } from "./cta-visuals/TerminalOverlay";
import { DecodedText } from "./cta-visuals/DecodedText";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MagneticLink } from "@/components/ui/MagneticLink";

export default function CTA() {
    return (
        <section className="min-h-[90vh] flex items-center justify-center bg-black relative overflow-hidden group">
            {/* Visual Layers */}
            <motion.div
                className="absolute inset-0 z-0"
                initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                viewport={{ margin: "-10%", once: true }}
                transition={{ duration: 1.5, ease: "easeOut" }}
            >
                <BlackHoleVisual />
            </motion.div>
            <TerminalOverlay />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black opacity-80 pointer-events-none z-10" />

            <Container className="text-center relative z-20">
                {/* Backdrop Blur Container with Noise */}
                <div className="absolute inset-0 -z-10 bg-black/20 backdrop-blur-[2px] rounded-3xl transform scale-110 overflow-hidden border border-white/5">
                    <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="relative p-8 md:p-12"
                >
                    <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-500 mb-8 drop-shadow-2xl animate-text-shimmer bg-[length:200%_auto]">
                        <DecodedText text="Ready to Architect?" />
                    </h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Join thousands of developers building better software with precision tools.
                        <br />
                        <span className="text-zinc-500 text-sm mt-4 block tracking-widest uppercase">No hallucinations. Just shipped code.</span>
                    </motion.p>

                    <div className="flex justify-center">
                        <MagneticLink href="#" className="relative group/btn">
                            <div className="absolute inset-0 bg-blue-500/30 blur-3xl rounded-full opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                            <Button size="lg" className="min-w-[280px] h-20 text-xl rounded-full relative overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all duration-300 group-hover/btn:scale-105 group-hover/btn:border-blue-500/50 group-hover/btn:shadow-[0_0_50px_-10px_rgba(59,130,246,0.5)] text-white">
                                <span className="relative z-10 flex items-center justify-center gap-3 font-medium tracking-wide">
                                    Get Started Now
                                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
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
