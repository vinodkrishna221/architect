"use client";

import { motion } from "framer-motion";
import { Check, Clock, Lock, Play, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROMPT_CATEGORIES, CATEGORY_INFO } from "@/lib/ai/prompts/implementation-prompts";
import type { PromptCategory } from "@/lib/types";

interface CategoryProgress {
    category: PromptCategory;
    promptCount: number;
    completedCount: number;
    status: "pending" | "current" | "completed" | "skipped";
}

interface SequenceProgressProps {
    categories: CategoryProgress[];
    currentCategory?: PromptCategory;
    onCategoryClick?: (category: PromptCategory) => void;
}

export function SequenceProgress({
    categories,
    currentCategory,
    onCategoryClick,
}: SequenceProgressProps) {
    const completedRatio = categories.filter(c => c.status === "completed" || c.status === "skipped").length / categories.length;

    return (
        <div className="p-4 bg-[#0A0A0A] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                    <Clock className="w-4 h-4 text-white/40" />
                    {completedRatio > 0 && completedRatio < 1 && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    )}
                </div>
                <span className="text-sm font-medium text-white/60">Implementation Timeline</span>
            </div>

            <div className="space-y-1 relative">
                {/* Connecting Line (Optional visual detail) */}
                <div className="absolute left-[23px] top-4 bottom-4 w-px bg-white/5 -z-10" />

                {PROMPT_CATEGORIES.map((category, index) => {
                    const categoryData = categories.find(c => c.category === category);
                    const info = CATEGORY_INFO[category];
                    const isCurrent = category === currentCategory;
                    const isCompleted = categoryData?.status === "completed";
                    const isSkipped = categoryData?.status === "skipped";
                    const isPending = !categoryData || categoryData.status === "pending";

                    return (
                        <button
                            key={category}
                            onClick={() => onCategoryClick?.(category)}
                            disabled={isPending && !isCurrent}
                            className={cn(
                                "group w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left relative overflow-hidden",
                                isCurrent && "bg-white/[0.03] border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
                                isCompleted && "opacity-80 hover:opacity-100 hover:bg-white/[0.02]",
                                isSkipped && "opacity-50",
                                isPending && !isCurrent && "opacity-40 cursor-not-allowed",
                                !isPending && !isCurrent && "cursor-pointer"
                            )}
                        >
                            {/* Active indicator bar */}
                            {isCurrent && (
                                <motion.div
                                    layoutId="active-nav"
                                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                                />
                            )}

                            {/* Step indicator */}
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 transition-all shadow-inner",
                                isCompleted && "bg-emerald-500 text-white shadow-[0_2px_10px_rgba(16,185,129,0.3)]",
                                isSkipped && "bg-white/10 text-white/40",
                                isCurrent && "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
                                isPending && !isCurrent && "bg-white/5 text-white/20 border border-white/5"
                            )}>
                                {isCompleted ? (
                                    <Check className="w-3.5 h-3.5" />
                                ) : isSkipped ? (
                                    <SkipForward className="w-3 h-3" />
                                ) : isCurrent ? (
                                    <Play className="w-3 h-3 ml-0.5" />
                                ) : isPending ? (
                                    <Lock className="w-3 h-3" />
                                ) : (
                                    index + 1
                                )}
                            </div>

                            {/* Category info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "text-sm font-medium truncate transition-colors",
                                        isCurrent ? "text-emerald-400 text-shadow-sm" : isCompleted ? "text-white/80" : "text-white/50"
                                    )}>
                                        {info.title}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] shrink-0",
                                        isCurrent ? "text-emerald-400/60" : "text-white/20"
                                    )}>
                                        {info.estimatedTime}
                                    </span>
                                </div>

                                {categoryData && categoryData.promptCount > 0 && (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden max-w-[60px]">
                                            <div
                                                className={cn("h-full rounded-full transition-all duration-500",
                                                    isCompleted ? "bg-emerald-500" : "bg-white/20"
                                                )}
                                                style={{ width: `${(categoryData.completedCount / categoryData.promptCount) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-[10px] text-white/30">
                                            {categoryData.completedCount}/{categoryData.promptCount}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Overall progress bar with shockwave effect */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-white/40">Overall Progress</span>
                    <span className={cn("transition-colors", completedRatio === 1 ? "text-emerald-400 font-medium" : "text-white/60")}>
                        {Math.round(completedRatio * 100)}%
                    </span>
                </div>
                <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="absolute h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${completedRatio * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Shockwave gloss effect */}
                        <div className="absolute top-0 right-0 bottom-0 w-[50px] bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer" />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

/**
 * Minimal version for compact display
 */
export function SequenceProgressMini({
    completedCategories,
    totalCategories,
}: {
    completedCategories: number;
    totalCategories: number;
}) {
    const percentage = (completedCategories / totalCategories) * 100;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-emerald-500 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="absolute top-0 right-0 bottom-0 w-[20px] bg-white/30 blur-[2px]" />
                </motion.div>
            </div>
            <span className="text-xs text-white/40 tabular-nums">
                {completedCategories}/{totalCategories}
            </span>
        </div>
    );
}
