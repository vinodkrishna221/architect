"use client";

import { motion } from "framer-motion";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Logo } from "@/components/ui/Logo";
import { Sparkles, Zap, FileText, MessageSquare, Edit3, Crown, Rocket, Gift } from "lucide-react";
import Link from "next/link";

const creditActions = [
    {
        icon: MessageSquare,
        action: "Interview Messages",
        credits: "0.1",
        description: "Per message during AI interview",
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/20",
    },
    {
        icon: FileText,
        action: "Blueprint Suite Generation",
        credits: "3",
        description: "Generate all 6 PRD documents",
        color: "text-purple-400",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/20",
        highlight: true,
    },
    {
        icon: Edit3,
        action: "AI-assisted Edits",
        credits: "0.3",
        description: "Per AI-powered document refinement",
        color: "text-emerald-400",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/20",
        comingSoon: true,
    },
    {
        icon: Rocket,
        action: "Project Creation",
        credits: "Free",
        description: "Unlimited projects, no restrictions",
        color: "text-amber-400",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/20",
    },
];

const betaPerks = [
    { icon: Gift, text: "30 credits to start" },
    { icon: Crown, text: "Early adopter badge" },
    { icon: Zap, text: "Priority support" },
];

export default function PricingPage() {
    return (
        <AuroraBackground>
            <KineticBackground>
                <div className="relative w-full min-h-screen overflow-y-auto">
                    {/* Header */}
                    <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/5">
                        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                            <Link href="/" className="flex items-center gap-2">
                                <Logo showText={true} className="h-8" />
                            </Link>
                            <nav className="flex items-center gap-6">
                                <Link href="/features" className="text-white/60 hover:text-white transition-colors text-sm">
                                    Features
                                </Link>
                                <Link href="/roadmap" className="text-white/60 hover:text-white transition-colors text-sm">
                                    Roadmap
                                </Link>
                                <Link href="/waitlist" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
                                    Join Waitlist
                                </Link>
                            </nav>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="container mx-auto px-6 pt-32 pb-20">
                        {/* Hero Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center mb-16"
                        >
                            {/* Coming Soon Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 mb-8">
                                <Sparkles className="w-4 h-4 text-amber-400" />
                                <span className="text-amber-300 text-sm font-medium">Pricing Coming Soon</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                                Simple, Transparent{" "}
                                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Credit System
                                </span>
                            </h1>
                            <p className="text-xl text-white/60 max-w-2xl mx-auto">
                                Pay only for what you use. No subscriptions, no hidden fees.
                                Generate professional PRDs with our AI-powered platform.
                            </p>
                        </motion.div>

                        {/* Credit System Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                        >
                            {creditActions.map((item, index) => (
                                <motion.div
                                    key={item.action}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                    className={`relative p-6 rounded-2xl border backdrop-blur-sm ${item.bgColor} ${item.borderColor} ${item.highlight ? "ring-2 ring-purple-500/30" : ""
                                        } ${"comingSoon" in item && item.comingSoon ? "opacity-75" : ""}`}
                                >
                                    {item.highlight && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-purple-500 rounded-full text-xs font-bold text-white">
                                            POPULAR
                                        </div>
                                    )}
                                    {"comingSoon" in item && item.comingSoon && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 rounded-full text-xs font-bold text-white">
                                            COMING SOON
                                        </div>
                                    )}
                                    <div className={`w-12 h-12 rounded-xl ${item.bgColor} border ${item.borderColor} flex items-center justify-center mb-4`}>
                                        <item.icon className={`w-6 h-6 ${item.color}`} />
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-1">{item.action}</h3>
                                    <p className="text-white/50 text-sm mb-4">{item.description}</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-3xl font-bold ${item.color}`}>
                                            {item.credits}
                                        </span>
                                        {item.credits !== "Free" && (
                                            <span className="text-white/40 text-sm">credits</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Beta Testers Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 backdrop-blur-sm">
                                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse" />

                                <div className="relative text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 mb-6">
                                        <Crown className="w-8 h-8 text-blue-400" />
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                                        Beta Testers Get More
                                    </h2>
                                    <p className="text-white/60 mb-8 max-w-lg mx-auto">
                                        Join our beta program and help shape the future of PRD generation.
                                        Early adopters receive exclusive benefits.
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                                        {betaPerks.map((perk, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10"
                                            >
                                                <perk.icon className="w-4 h-4 text-blue-400" />
                                                <span className="text-white/80 text-sm">{perk.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Link
                                        href="/waitlist"
                                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                                    >
                                        <Sparkles className="w-5 h-5" />
                                        Join the Beta
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* FAQ Preview */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="mt-20 text-center"
                        >
                            <p className="text-white/40 text-sm">
                                Have questions? Reach out to us at{" "}
                                <a href="mailto:support@codedale.tech" className="text-blue-400 hover:text-blue-300 transition-colors">
                                    support@codedale.tech
                                </a>
                            </p>
                        </motion.div>
                    </main>
                </div>
            </KineticBackground>
        </AuroraBackground>
    );
}
