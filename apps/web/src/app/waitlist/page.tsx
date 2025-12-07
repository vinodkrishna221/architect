"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Loader2, AlertCircle, Users, Twitter, Linkedin, Link2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

interface SubmitResponse {
    success: boolean;
    position?: number;
    totalCount?: number;
    error?: string;
}

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [jobRole, setJobRole] = useState("");
    const [referralSource, setReferralSource] = useState("");
    const [reason, setReason] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [waitlistCount, setWaitlistCount] = useState<number | null>(null);
    const [position, setPosition] = useState<number | null>(null);
    const [copied, setCopied] = useState(false);

    // Fetch waitlist count on mount
    useEffect(() => {
        fetch("/api/waitlist/count")
            .then(res => res.json())
            .then(data => {
                if (data.count) setWaitlistCount(data.count);
            })
            .catch(() => { /* silently fail */ });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, jobRole, referralSource, reason }),
            });

            const data: SubmitResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setStatus("success");
            if (data.position) setPosition(data.position);
            if (data.totalCount) setWaitlistCount(data.totalCount);
            // Reset form
            setEmail("");
            setName("");
            setJobRole("");
            setReferralSource("");
            setReason("");
        } catch (error: unknown) {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Failed to join waitlist");
        }
    };

    const shareUrl = typeof window !== "undefined" ? window.location.href : "https://architect.dev/waitlist";
    const shareText = "Just joined the waitlist for Architect - an AI-powered development platform. Stop hallucinating, start building! 🚀";

    const handleShare = (platform: "twitter" | "linkedin" | "copy") => {
        if (platform === "twitter") {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
        } else if (platform === "linkedin") {
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, "_blank");
        } else {
            navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const jobRoleOptions = [
        { value: "", label: "Select your role (optional)" },
        { value: "developer", label: "Developer" },
        { value: "designer", label: "Designer" },
        { value: "founder", label: "Founder / Entrepreneur" },
        { value: "pm", label: "Product Manager" },
        { value: "student", label: "Student" },
        { value: "other", label: "Other" },
    ];

    const referralOptions = [
        { value: "", label: "How did you hear about us? (optional)" },
        { value: "twitter", label: "Twitter / X" },
        { value: "linkedin", label: "LinkedIn" },
        { value: "friend", label: "Friend or colleague" },
        { value: "search", label: "Google search" },
        { value: "youtube", label: "YouTube" },
        { value: "other", label: "Other" },
    ];

    const inputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
    const selectClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer";

    return (
        <div className="min-h-screen bg-black">
            <KineticBackground>
                <main className="relative flex flex-col items-center justify-center text-white w-full min-h-screen">

                    <div className="absolute top-6 left-6 z-50">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo />
                        </Link>
                    </div>

                    <div className="relative z-10 w-full max-w-md px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            {/* Social Proof Counter */}
                            {waitlistCount && waitlistCount > 0 && status !== "success" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center justify-center gap-2 text-sm text-zinc-400 mb-6 bg-white/5 rounded-full py-2 px-4"
                                >
                                    <Users className="w-4 h-4" />
                                    <span>Join <strong className="text-white">{waitlistCount.toLocaleString()}+</strong> others on the waitlist</span>
                                </motion.div>
                            )}

                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                                    Join the Waitlist
                                </h1>
                                <p className="text-zinc-400">
                                    Be the first to access the Architect. <br />
                                    Stop hallucinating, start building.
                                </p>
                            </div>

                            {status === "success" ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center"
                                >
                                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                                        <Check className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-400 mb-1">You&apos;re on the list!</h3>
                                    {position && (
                                        <p className="text-white font-medium mb-2">
                                            You&apos;re #{position.toLocaleString()} in line
                                        </p>
                                    )}
                                    <p className="text-zinc-400 text-sm mb-6">
                                        We&apos;ll notify you as soon as we&apos;re ready for you.
                                    </p>

                                    {/* Share Section */}
                                    <div className="border-t border-white/10 pt-6">
                                        <p className="text-sm text-zinc-400 mb-4">Get priority access by sharing:</p>
                                        <div className="flex items-center justify-center gap-3">
                                            <button
                                                onClick={() => handleShare("twitter")}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                                                aria-label="Share on Twitter"
                                            >
                                                <Twitter className="w-5 h-5 text-zinc-400 group-hover:text-[#1DA1F2]" />
                                            </button>
                                            <button
                                                onClick={() => handleShare("linkedin")}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                                                aria-label="Share on LinkedIn"
                                            >
                                                <Linkedin className="w-5 h-5 text-zinc-400 group-hover:text-[#0A66C2]" />
                                            </button>
                                            <button
                                                onClick={() => handleShare("copy")}
                                                className="p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group relative"
                                                aria-label="Copy link"
                                            >
                                                <Link2 className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                                                {copied && (
                                                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                                                        Copied!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        className="mt-6 text-zinc-400 hover:text-white"
                                        onClick={() => setStatus("idle")}
                                    >
                                        Add another email
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Email - Required */}
                                    <div>
                                        <label htmlFor="email" className="sr-only">Email address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email *"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Name - Optional */}
                                    <div>
                                        <label htmlFor="name" className="sr-only">Your name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Your name (optional)"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Job Role - Optional */}
                                    <div className="relative">
                                        <label htmlFor="jobRole" className="sr-only">Your role</label>
                                        <select
                                            id="jobRole"
                                            value={jobRole}
                                            onChange={(e) => setJobRole(e.target.value)}
                                            className={selectClass}
                                            style={{ color: jobRole ? 'white' : 'rgb(82 82 91)' }}
                                        >
                                            {jobRoleOptions.map(opt => (
                                                <option key={opt.value} value={opt.value} className="bg-zinc-900">
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Referral Source - Optional */}
                                    <div className="relative">
                                        <label htmlFor="referralSource" className="sr-only">How did you hear about us</label>
                                        <select
                                            id="referralSource"
                                            value={referralSource}
                                            onChange={(e) => setReferralSource(e.target.value)}
                                            className={selectClass}
                                            style={{ color: referralSource ? 'white' : 'rgb(82 82 91)' }}
                                        >
                                            {referralOptions.map(opt => (
                                                <option key={opt.value} value={opt.value} className="bg-zinc-900">
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    {/* Why do you want to join - Optional */}
                                    <div>
                                        <label htmlFor="reason" className="sr-only">Why do you want to join?</label>
                                        <textarea
                                            id="reason"
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            placeholder="Why do you want to join? (optional)"
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>

                                    {status === "error" && (
                                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <span>{errorMessage}</span>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        variant="default"
                                        className="w-full h-12 text-lg"
                                        disabled={status === "loading"}
                                    >
                                        {status === "loading" ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Joining...
                                            </>
                                        ) : (
                                            <>
                                                Join Waitlist
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>

                                    {/* Privacy Policy Link */}
                                    <p className="text-xs text-center text-zinc-500">
                                        By joining, you agree to our{" "}
                                        <Link href="/privacy" className="underline hover:text-zinc-400 transition-colors">
                                            Privacy Policy
                                        </Link>
                                    </p>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </main>
            </KineticBackground>
        </div>
    );
}
