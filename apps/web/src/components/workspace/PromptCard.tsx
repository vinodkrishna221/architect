"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion";
import {
    ChevronDown,
    Copy,
    Check,
    RefreshCw,
    Clock,
    Lock,
    Play,
    CheckCircle2,
    SkipForward,
    AlertCircle,
    Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImplementationPrompt, PromptStatus } from "@/lib/types";
import { CATEGORY_INFO } from "@/lib/ai/prompts/implementation-prompts";
import { buildCopyContext } from "@/lib/ai/prompts/implementation-prompts";
import { PrerequisiteCheckerInline } from "./PrerequisiteChecker";

interface PromptCardProps {
    prompt: ImplementationPrompt;
    projectTitle: string;
    techStack: string;
    onStatusChange: (promptId: string, status: PromptStatus) => Promise<void>;
    onRegenerate: (promptId: string) => Promise<void>;
    isRegenerating?: boolean;
    allPrompts: ImplementationPrompt[];
}

// Hook for typewriter effect
function useTypewriter(text: string, speed = 1, start = false) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        if (!start) {
            setDisplayedText(text);
            return;
        }

        let i = 0;
        setDisplayedText("");

        const interval = setInterval(() => {
            if (i < text.length) {
                setDisplayedText((prev) => prev + text.charAt(i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, speed, start]);

    return displayedText;
}

export function PromptCard({
    prompt,
    projectTitle,
    techStack,
    onStatusChange,
    onRegenerate,
    isRegenerating = false,
}: PromptCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Spotlight effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    const categoryInfo = CATEGORY_INFO[prompt.category];
    const isLocked = prompt.status === "pending";
    const isCompleted = prompt.status === "completed";
    const isSkipped = prompt.status === "skipped";

    // Streaming text effect for prompt content
    // Only animate if we just finished regenerating or it's a fresh view of a non-locked prompt
    const [shouldAnimateText, setShouldAnimateText] = useState(false);
    useEffect(() => {
        if (!isRegenerating && !isLocked) {
            setShouldAnimateText(true);
        }
    }, [isRegenerating, isLocked]);

    const displayedContent = useTypewriter(prompt.content, 1, isRegenerating); // Speed up for demo

    const handleCopy = async () => {
        const context = buildCopyContext(
            projectTitle,
            techStack,
            prompt.category,
            prompt.title,
            []
        );
        const fullContent = context + prompt.content;

        try {
            await navigator.clipboard.writeText(fullContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleStatusChange = async (newStatus: PromptStatus) => {
        setIsUpdating(true);
        try {
            await onStatusChange(prompt.id, newStatus);
        } finally {
            setIsUpdating(false);
        }
    };

    const StatusIcon = () => {
        switch (prompt.status) {
            case "pending": return <Lock className="w-4 h-4 text-white/30" />;
            case "unlocked": return <Play className="w-4 h-4 text-blue-400" />;
            case "in_progress": return <Clock className="w-4 h-4 text-amber-400" />;
            case "completed": return <CheckCircle2 className="w-4 h-4 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]" />;
            case "skipped": return <SkipForward className="w-4 h-4 text-white/40" />;
            default: return null;
        }
    };

    return (
        <motion.div
            layout
            onMouseMove={handleMouseMove}
            className={cn(
                "group relative rounded-xl border transition-all overflow-hidden",
                isLocked ? "border-white/5 bg-white/[0.01] cursor-not-allowed" : "border-white/10 bg-[#0A0A0A]",
                isCompleted && !isLocked && "border-emerald-500/20 bg-emerald-500/[0.02]",
                isSkipped && "opacity-60"
            )}
        >
            {/* Spotlight Gradient */}
            {!isLocked && (
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
                            radial-gradient(
                                650px circle at ${mouseX}px ${mouseY}px,
                                rgba(255, 255, 255, 0.1),
                                transparent 80%
                            )
                        `,
                    }}
                />
            )}

            {/* Header */}
            <button
                onClick={() => !isLocked && setIsExpanded(!isExpanded)}
                disabled={isLocked}
                className="relative w-full p-4 flex items-center gap-4 text-left z-10"
            >
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium shrink-0 transition-colors border",
                    isCompleted ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                        isLocked ? "bg-white/5 border-white/5 text-white/20" :
                            "bg-white/5 border-white/10 text-white/60 group-hover:border-white/20 group-hover:text-white"
                )}>
                    {prompt.sequence}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                        <span className={cn(
                            "font-medium truncate transition-colors",
                            isCompleted ? "text-emerald-400" :
                                isLocked ? "text-white/30" :
                                    "text-white group-hover:text-blue-100"
                        )}>
                            {prompt.title}
                        </span>
                        <StatusIcon />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">{categoryInfo.title}</span>
                        {prompt.estimatedTime && (
                            <>
                                <span className="text-white/20">•</span>
                                <span className="text-xs text-white/30">{prompt.estimatedTime}</span>
                            </>
                        )}
                        {!isLocked && prompt.prerequisites.length > 0 && (
                            <>
                                <span className="text-white/20">•</span>
                                <PrerequisiteCheckerInline
                                    prerequisites={prompt.prerequisites}
                                    allPrompts={allPrompts}
                                />
                            </>
                        )}
                    </div>
                </div>

                {!isLocked && (
                    <ChevronDown className={cn(
                        "w-5 h-5 text-white/30 transition-transform duration-300",
                        isExpanded && "rotate-180"
                    )} />
                )}
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && !isLocked && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "circOut" }}
                        className="relative z-10 border-t border-white/5"
                    >
                        <div className="p-4 space-y-6 bg-black/20 backdrop-blur-sm">

                            {/* Prerequisites Detailed (if pending) */}
                            {prompt.prerequisites.length > 0 && prompt.status === "in_progress" && (
                                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle className="w-4 h-4 text-amber-400" />
                                        <span className="text-sm font-medium text-amber-400">Wait! Checks required</span>
                                    </div>
                                    <ul className="space-y-1.5 ml-1">
                                        {prompt.prerequisites.map((prereq, i) => (
                                            <li key={i} className="text-xs text-amber-200/60 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-amber-400" />
                                                {prereq}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* User Actions Checklist */}
                            {prompt.userActions.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Before You Prompt</h4>
                                    <div className="space-y-1">
                                        {prompt.userActions.map((action, i) => (
                                            <label key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group/item">
                                                <input
                                                    type="checkbox"
                                                    className="mt-0.5 rounded border-white/20 bg-white/5 checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer"
                                                />
                                                <span className="text-sm text-white/60 group-hover/item:text-white/80 transition-colors">
                                                    {action}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Glass Terminal Code Block */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-white/40">
                                    <Terminal className="w-3.5 h-3.5" />
                                    <span>Prompt Content</span>
                                </div>
                                <div className="relative group/code">
                                    <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl opacity-0 group-hover/code:opacity-100 transition-opacity duration-500" />
                                    <div className="relative rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-inner overflow-hidden">
                                        {/* Terminal Header */}
                                        <div className="flex items-center gap-1.5 px-4 py-3 bg-white/5 border-b border-white/5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500/30" />
                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                                            <div className="ml-2 text-[10px] text-white/30 font-mono">
                                                prompts/{prompt.category}/{prompt.sequence}.md
                                            </div>
                                        </div>

                                        {/* Content with skeleton or streaming */}
                                        <div className="p-4 overflow-x-auto">
                                            {isRegenerating ? (
                                                <div className="space-y-3 animate-pulse">
                                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                                    <div className="h-4 bg-white/10 rounded w-1/2" />
                                                    <div className="h-4 bg-white/10 rounded w-5/6" />
                                                    <div className="h-4 bg-white/10 rounded w-2/3" />
                                                    <div className="h-4 bg-white/10 rounded w-full" />
                                                </div>
                                            ) : (
                                                <pre className="text-xs font-mono text-blue-100/80 whitespace-pre-wrap leading-relaxed">
                                                    {prompt.content}
                                                    {/* Note: In full implementation we could use displayedText for streaming, 
                                                        but for now direct content is better UX to avoid jumping on expand */}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                                <button
                                    onClick={handleCopy}
                                    className={cn(
                                        "flex-1 relative overflow-hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95",
                                        copied
                                            ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                                            : "bg-white/5 hover:bg-white/10 text-white hover:text-white border border-white/10 hover:border-white/20"
                                    )}
                                >
                                    <AnimatePresence mode="wait">
                                        {copied ? (
                                            <motion.div
                                                key="copied"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                <span>Copied!</span>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="copy"
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                exit={{ scale: 0.5, opacity: 0 }}
                                                className="flex items-center gap-2"
                                            >
                                                <Copy className="w-4 h-4" />
                                                <span>Copy for Cursor</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>

                                <button
                                    onClick={() => onRegenerate(prompt.id)}
                                    disabled={isRegenerating}
                                    className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 group/regen"
                                    title="Regenerate (0.2 credits)"
                                >
                                    <RefreshCw className={cn(
                                        "w-4 h-4 transition-transform group-hover/regen:rotate-180 duration-500",
                                        isRegenerating && "animate-spin"
                                    )} />
                                </button>
                            </div>

                            {/* Verification Actions */}
                            {!isCompleted && !isSkipped && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleStatusChange("completed")}
                                        disabled={isUpdating}
                                        className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-medium border border-emerald-500/20 transition-all active:scale-95 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
                                    >
                                        Mark Complete
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange("skipped")}
                                        disabled={isUpdating}
                                        className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/60 text-sm font-medium border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        Skip
                                    </button>
                                </div>
                            )}

                            {isCompleted && (
                                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                                    <div className="flex items-center gap-2 text-emerald-400/80 text-sm">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span>Marked as complete</span>
                                    </div>
                                    <button
                                        onClick={() => handleStatusChange("unlocked")}
                                        className="text-xs text-white/30 hover:text-white/60 underline decoration-white/10 underline-offset-4 transition-colors"
                                    >
                                        Undo
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
