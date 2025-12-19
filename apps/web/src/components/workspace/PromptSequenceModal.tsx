"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, ChevronRight, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_INFO, PROMPT_CATEGORIES } from "@/lib/ai/prompts/implementation-prompts";
import type { PromptCategory } from "@/lib/types";

interface PromptSequenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (skipCategories: PromptCategory[]) => void;
    creditCost: number;
    userCredits: number;
    projectTitle: string;
    isGenerating?: boolean;
}

export function PromptSequenceModal({
    isOpen,
    onClose,
    onConfirm,
    creditCost,
    userCredits,
    projectTitle,
    isGenerating = false,
}: PromptSequenceModalProps) {
    const [selectedCategories, setSelectedCategories] = useState<Set<PromptCategory>>(
        new Set(PROMPT_CATEGORIES)
    );
    const [showAdvanced, setShowAdvanced] = useState(false);

    const hasEnoughCredits = userCredits >= creditCost;

    const toggleCategory = (category: PromptCategory) => {
        const newSelected = new Set(selectedCategories);
        if (newSelected.has(category)) {
            newSelected.delete(category);
        } else {
            newSelected.add(category);
        }
        setSelectedCategories(newSelected);
    };

    const handleConfirm = () => {
        const skipCategories = PROMPT_CATEGORIES.filter(c => !selectedCategories.has(c));
        onConfirm(skipCategories);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-lg bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Gloss */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                    {/* Header */}
                    <div className="relative p-6 pb-4">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Zap className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Generate Implementation Prompts
                                </h2>
                                <p className="text-sm text-white/50">
                                    {projectTitle}
                                </p>
                            </div>
                        </div>

                        <p className="text-white/70 text-sm leading-relaxed">
                            Your architecture is complete! Ready to generate step-by-step
                            implementation prompts for AI coding assistants like Cursor, Copilot, or Claude?
                        </p>
                    </div>

                    {/* Credit Cost Preview */}
                    <div className="mx-6 p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/60">Credit Cost</span>
                            <span className={cn(
                                "text-lg font-semibold",
                                hasEnoughCredits ? "text-emerald-400" : "text-red-400"
                            )}>
                                {creditCost} credits
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-white/40">Your balance</span>
                            <span className={cn(
                                "font-medium",
                                hasEnoughCredits ? "text-white/60" : "text-red-400"
                            )}>
                                {userCredits.toFixed(1)} credits
                            </span>
                        </div>

                        {!hasEnoughCredits && (
                            <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                                <span className="text-xs text-red-300">
                                    Insufficient credits. You need {(creditCost - userCredits).toFixed(1)} more credits.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Advanced Options */}
                    <div className="px-6 py-4">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/70 transition-colors"
                        >
                            <ChevronRight className={cn(
                                "w-4 h-4 transition-transform",
                                showAdvanced && "rotate-90"
                            )} />
                            Skip specific categories
                        </button>

                        <AnimatePresence>
                            {showAdvanced && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-4 space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {PROMPT_CATEGORIES.map((category) => {
                                            const info = CATEGORY_INFO[category];
                                            const isSelected = selectedCategories.has(category);

                                            return (
                                                <button
                                                    key={category}
                                                    onClick={() => toggleCategory(category)}
                                                    className={cn(
                                                        "w-full p-3 rounded-lg border text-left transition-all active:scale-[0.99]",
                                                        isSelected
                                                            ? "bg-white/5 border-emerald-500/30"
                                                            : "bg-white/[0.02] border-white/5 opacity-50"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors",
                                                            isSelected
                                                                ? "bg-emerald-500 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                                : "border-white/20"
                                                        )}>
                                                            {isSelected && <Check className="w-3 h-3 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-medium text-white">{info.title}</div>
                                                            <div className="text-xs text-white/40 truncate">{info.description}</div>
                                                        </div>
                                                        <span className="text-xs text-white/30 shrink-0">{info.estimatedTime}</span>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="p-6 pt-2 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors active:scale-95"
                            disabled={isGenerating}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!hasEnoughCredits || isGenerating || selectedCategories.size === 0}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 active:scale-95",
                                hasEnoughCredits && selectedCategories.size > 0
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-white/5 text-white/30 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    Generate Prompts
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
