"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { PromptCard } from "./PromptCard";
import { SequenceProgress } from "./SequenceProgress";
import { PromptSequenceModal } from "./PromptSequenceModal";
import type { ImplementationPrompt, PromptSequenceInfo, PromptCategory, PromptStatus } from "@/lib/types";
import { PROMPT_CATEGORIES, CATEGORY_INFO } from "@/lib/ai/prompts/implementation-prompts";
import { CREDIT_COSTS } from "@/lib/constants/credits";

interface PromptSequencePanelProps {
    projectId: string;
    suiteId: string;
    suiteStatus: string;
    onCreditsChange?: () => void;
}

export function PromptSequencePanel({
    projectId,
    suiteId,
    suiteStatus,
    onCreditsChange,
}: PromptSequencePanelProps) {
    const [sequence, setSequence] = useState<PromptSequenceInfo | null>(null);
    const [prompts, setPrompts] = useState<ImplementationPrompt[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<PromptCategory | null>(null);

    // Data from API
    const [projectTitle, setProjectTitle] = useState("");
    const [userCredits, setUserCredits] = useState(0);

    // Fetch prompts for this project
    const fetchPrompts = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`/api/ai/prompts/by-project/${projectId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch prompts");
            }

            setSequence(data.sequence);
            setPrompts(data.prompts || []);
            if (data.projectTitle) setProjectTitle(data.projectTitle);
            if (typeof data.userCredits === 'number') setUserCredits(data.userCredits);

            // Set active category to first incomplete one
            if (data.prompts?.length > 0) {
                const firstIncomplete = data.prompts.find(
                    (p: ImplementationPrompt) => p.status !== "completed" && p.status !== "skipped"
                );
                if (firstIncomplete) {
                    setActiveCategory(firstIncomplete.category);
                }
            }
        } catch (err) {
            console.error("Error fetching prompts:", err);
            setError(err instanceof Error ? err.message : "Failed to load prompts");
        } finally {
            setIsLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        if (projectId) {
            fetchPrompts();
        }
    }, [projectId, fetchPrompts]);

    // Generate prompts
    const handleGenerate = async (skipCategories: PromptCategory[]) => {
        try {
            setIsGenerating(true);
            setShowGenerateModal(false);

            const response = await fetch("/api/ai/generate-prompts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ suiteId, skipCategories }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate prompts");
            }

            // Refresh prompts list
            await fetchPrompts();
            onCreditsChange?.();
        } catch (err) {
            console.error("Error generating prompts:", err);
            setError(err instanceof Error ? err.message : "Failed to generate prompts");
        } finally {
            setIsGenerating(false);
        }
    };

    // Update prompt status
    const handleStatusChange = async (promptId: string, status: PromptStatus) => {
        try {
            const response = await fetch(`/api/ai/prompts/${promptId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to update status");
            }

            // Update local state
            setPrompts(prev =>
                prev.map(p =>
                    p.id === promptId
                        ? { ...p, status, completedAt: data.completedAt }
                        : p
                )
            );

            // If completed/skipped, unlock next prompt locally
            if (status === "completed" || status === "skipped") {
                const currentPrompt = prompts.find(p => p.id === promptId);
                if (currentPrompt) {
                    setPrompts(prev =>
                        prev.map(p =>
                            p.sequence === currentPrompt.sequence + 1 && p.status === "pending"
                                ? { ...p, status: "unlocked" }
                                : p
                        )
                    );
                }
            }

            // Update sequence progress
            if (sequence && data.sequenceProgress) {
                setSequence({
                    ...sequence,
                    completedPrompts: data.sequenceProgress.completedPrompts,
                });
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    };

    // Regenerate a prompt
    const handleRegenerate = async (promptId: string) => {
        try {
            setRegeneratingId(promptId);

            const response = await fetch(`/api/ai/prompts/${promptId}/regenerate`, {
                method: "POST",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to regenerate prompt");
            }

            // Update local state
            setPrompts(prev =>
                prev.map(p =>
                    p.id === promptId
                        ? {
                            ...p,
                            content: data.content,
                            userActions: data.userActions,
                            acceptanceCriteria: data.acceptanceCriteria,
                            status: data.status,
                        }
                        : p
                )
            );

            onCreditsChange?.();
        } catch (err) {
            console.error("Error regenerating prompt:", err);
        } finally {
            setRegeneratingId(null);
        }
    };

    // Calculate category progress
    const categoryProgress = PROMPT_CATEGORIES.map(category => {
        const categoryPrompts = prompts.filter(p => p.category === category);
        const completedCount = categoryPrompts.filter(
            p => p.status === "completed" || p.status === "skipped"
        ).length;

        let status: "pending" | "current" | "completed" | "skipped" = "pending";
        if (completedCount === categoryPrompts.length && categoryPrompts.length > 0) {
            status = "completed";
        } else if (categoryPrompts.some(p => p.status !== "pending")) {
            status = "current";
        }

        return {
            category,
            promptCount: categoryPrompts.length,
            completedCount,
            status,
        };
    });

    // Determine tech stack from project (simplified - would come from blueprints)
    const techStack = "Next.js 15, TypeScript, Tailwind CSS, MongoDB";

    // Filter prompts by active category
    const filteredPrompts = activeCategory
        ? prompts.filter(p => p.category === activeCategory)
        : prompts;

    // Suite not complete - show message
    if (suiteStatus !== "complete") {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="p-4 rounded-2xl bg-white/5 mb-4">
                    <AlertCircle className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-lg font-medium text-white/70 mb-2">
                    Blueprints Not Ready
                </h3>
                <p className="text-sm text-white/40 max-w-sm">
                    Complete the blueprint generation first before generating
                    implementation prompts.
                </p>
            </div>
        );
    }

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-white/20 border-t-emerald-500 rounded-full animate-spin" />
            </div>
        );
    }

    // No prompts generated yet
    if (!sequence || prompts.length === 0) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 mb-4">
                        <Sparkles className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">
                        Ready for Implementation
                    </h3>
                    <p className="text-sm text-white/50 max-w-sm mb-6">
                        Your architecture is complete! Generate step-by-step prompts
                        for AI coding assistants like Cursor or Claude.
                    </p>
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        disabled={isGenerating}
                        className={cn(
                            "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
                            "bg-gradient-to-r from-emerald-500 to-teal-500 text-white",
                            "hover:shadow-lg hover:shadow-emerald-500/20",
                            isGenerating && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {isGenerating ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                Generate Prompts ({CREDIT_COSTS.PROMPT_SEQUENCE} credits)
                            </>
                        )}
                    </button>
                </div>

                <PromptSequenceModal
                    isOpen={showGenerateModal}
                    onClose={() => setShowGenerateModal(false)}
                    onConfirm={handleGenerate}
                    creditCost={CREDIT_COSTS.PROMPT_SEQUENCE}
                    userCredits={userCredits}
                    projectTitle={projectTitle}
                    isGenerating={isGenerating}
                />
            </div>
        );
    }

    // Show prompts
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/5 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-semibold text-white">Implementation Prompts</h2>
                    </div>
                    <div className="text-sm text-white/40">
                        {sequence.completedPrompts}/{sequence.totalPrompts} complete
                    </div>
                </div>

                {/* Progress */}
                <SequenceProgress
                    categories={categoryProgress}
                    currentCategory={activeCategory || undefined}
                    onCategoryClick={(category) => setActiveCategory(category)}
                />
            </div>

            {/* Prompts list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="popLayout">
                    {filteredPrompts.map((prompt) => (
                        <motion.div
                            key={prompt.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <PromptCard
                                prompt={prompt}
                                projectTitle={projectTitle}
                                techStack={techStack}
                                onStatusChange={handleStatusChange}
                                onRegenerate={handleRegenerate}
                                isRegenerating={regeneratingId === prompt.id}
                                allPrompts={prompts}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
