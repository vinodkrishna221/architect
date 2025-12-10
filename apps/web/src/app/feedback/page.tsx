"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Loader2, AlertCircle, MessageSquare, Lightbulb, Bug } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

type FeedbackType = "feedback" | "feature" | "bug";

interface SubmitResponse {
    success: boolean;
    message?: string;
    error?: string;
}

export default function FeedbackPage() {
    const [feedbackType, setFeedbackType] = useState<FeedbackType>("feedback");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("medium");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            // Get browser info for bug reports
            const browserInfo = feedbackType === "bug"
                ? `${navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`
                : undefined;

            const response = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: feedbackType,
                    email,
                    subject,
                    description,
                    priority: feedbackType === "bug" ? priority : undefined,
                    browserInfo,
                }),
            });

            const data: SubmitResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setStatus("success");
            // Reset form
            setEmail("");
            setSubject("");
            setDescription("");
            setPriority("medium");
        } catch (error: unknown) {
            setStatus("error");
            setErrorMessage(error instanceof Error ? error.message : "Failed to submit feedback");
        }
    };

    const feedbackTypes = [
        { id: "feedback" as const, label: "General Feedback", icon: MessageSquare, color: "blue" },
        { id: "feature" as const, label: "Feature Request", icon: Lightbulb, color: "amber" },
        { id: "bug" as const, label: "Report Bug", icon: Bug, color: "red" },
    ];

    const priorityOptions = [
        { value: "low", label: "Low - Minor issue" },
        { value: "medium", label: "Medium - Affects workflow" },
        { value: "high", label: "High - Major problem" },
        { value: "critical", label: "Critical - App unusable" },
    ];

    const inputClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";
    const selectClass = "w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer";

    return (
        <div className="min-h-screen bg-black">
            <KineticBackground>
                <main className="relative flex flex-col items-center justify-center text-white w-full min-h-screen py-20">

                    <div className="absolute top-6 left-6 z-50">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo />
                        </Link>
                    </div>

                    <div className="relative z-10 w-full max-w-lg px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                                    Send Feedback
                                </h1>
                                <p className="text-zinc-400">
                                    Help us improve The Architect
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
                                    <h3 className="text-lg font-semibold text-green-400 mb-1">Thank you!</h3>
                                    <p className="text-zinc-400 text-sm mb-6">
                                        Your feedback has been submitted. We appreciate your input!
                                    </p>
                                    <Button
                                        variant="ghost"
                                        className="text-zinc-400 hover:text-white"
                                        onClick={() => setStatus("idle")}
                                    >
                                        Submit another
                                    </Button>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {/* Feedback Type Selector */}
                                    <div className="grid grid-cols-3 gap-2">
                                        {feedbackTypes.map((type) => {
                                            const Icon = type.icon;
                                            const isActive = feedbackType === type.id;
                                            return (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFeedbackType(type.id)}
                                                    className={`p-3 rounded-lg border transition-all flex flex-col items-center gap-2 ${isActive
                                                            ? `bg-${type.color}-500/20 border-${type.color}-500/50 text-${type.color}-400`
                                                            : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20"
                                                        }`}
                                                    style={isActive ? {
                                                        backgroundColor: type.color === "blue" ? "rgba(59, 130, 246, 0.2)"
                                                            : type.color === "amber" ? "rgba(245, 158, 11, 0.2)"
                                                                : "rgba(239, 68, 68, 0.2)",
                                                        borderColor: type.color === "blue" ? "rgba(59, 130, 246, 0.5)"
                                                            : type.color === "amber" ? "rgba(245, 158, 11, 0.5)"
                                                                : "rgba(239, 68, 68, 0.5)",
                                                        color: type.color === "blue" ? "#60a5fa"
                                                            : type.color === "amber" ? "#fbbf24"
                                                                : "#f87171"
                                                    } : {}}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="text-xs font-medium">{type.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="sr-only">Email address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Your email *"
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label htmlFor="subject" className="sr-only">Subject</label>
                                        <input
                                            type="text"
                                            id="subject"
                                            required
                                            maxLength={200}
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            placeholder={
                                                feedbackType === "feature" ? "Feature title *"
                                                    : feedbackType === "bug" ? "Bug summary *"
                                                        : "Subject *"
                                            }
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* Priority - Only for bugs */}
                                    {feedbackType === "bug" && (
                                        <div className="relative">
                                            <label htmlFor="priority" className="sr-only">Priority</label>
                                            <select
                                                id="priority"
                                                value={priority}
                                                onChange={(e) => setPriority(e.target.value)}
                                                className={selectClass}
                                            >
                                                {priorityOptions.map(opt => (
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
                                    )}

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="sr-only">Description</label>
                                        <textarea
                                            id="description"
                                            required
                                            minLength={10}
                                            maxLength={2000}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder={
                                                feedbackType === "feature" ? "Describe the feature you'd like to see... *"
                                                    : feedbackType === "bug" ? "Steps to reproduce the bug... *"
                                                        : "Tell us what's on your mind... *"
                                            }
                                            rows={5}
                                            className={`${inputClass} resize-none`}
                                        />
                                        <p className="text-xs text-zinc-600 mt-1 text-right">
                                            {description.length}/2000
                                        </p>
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
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                Submit Feedback
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                </main>
            </KineticBackground>
        </div>
    );
}
