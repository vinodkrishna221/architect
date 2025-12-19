"use client";

import { AlertTriangle, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImplementationPrompt } from "@/lib/types";

interface PrerequisiteCheckerProps {
    prompt: ImplementationPrompt;
    allPrompts: ImplementationPrompt[];
    onProceedAnyway?: () => void;
    onCancel?: () => void;
}

/**
 * Component to check and display prerequisite status before allowing prompt use
 */
export function PrerequisiteChecker({
    prompt,
    allPrompts,
    onProceedAnyway,
    onCancel,
}: PrerequisiteCheckerProps) {
    if (prompt.prerequisites.length === 0) {
        return null;
    }

    // Find prerequisite prompts by title
    const prereqStatuses = prompt.prerequisites.map(prereqTitle => {
        const prereqPrompt = allPrompts.find(p => p.title === prereqTitle);
        return {
            title: prereqTitle,
            prompt: prereqPrompt,
            isComplete: prereqPrompt?.status === "completed" || prereqPrompt?.status === "skipped",
        };
    });

    const allComplete = prereqStatuses.every(p => p.isComplete);
    const incompleteCount = prereqStatuses.filter(p => !p.isComplete).length;

    if (allComplete) {
        return null; // All prerequisites are satisfied
    }

    return (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-amber-400 mb-1">
                        Incomplete Prerequisites
                    </h4>
                    <p className="text-sm text-amber-300/70 mb-3">
                        {incompleteCount} prerequisite{incompleteCount > 1 ? "s" : ""} should be completed first
                        for best results.
                    </p>

                    <ul className="space-y-2 mb-4">
                        {prereqStatuses.map((prereq, i) => (
                            <li
                                key={i}
                                className={cn(
                                    "flex items-center gap-2 text-sm",
                                    prereq.isComplete ? "text-emerald-400" : "text-amber-300"
                                )}
                            >
                                {prereq.isComplete ? (
                                    <Check className="w-4 h-4" />
                                ) : (
                                    <X className="w-4 h-4" />
                                )}
                                {prereq.title}
                                {prereq.prompt && (
                                    <span className="text-xs text-white/30">
                                        ({prereq.prompt.status})
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-2">
                        {onCancel && (
                            <button
                                onClick={onCancel}
                                className="px-3 py-1.5 rounded-lg text-sm bg-white/5 hover:bg-white/10 text-white/60 transition-colors"
                            >
                                Go Back
                            </button>
                        )}
                        {onProceedAnyway && (
                            <button
                                onClick={onProceedAnyway}
                                className="px-3 py-1.5 rounded-lg text-sm bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors"
                            >
                                Proceed Anyway
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Inline version for use within cards
 */
export function PrerequisiteCheckerInline({
    prerequisites,
    allPrompts,
}: {
    prerequisites: string[];
    allPrompts: ImplementationPrompt[];
}) {
    if (prerequisites.length === 0) {
        return null;
    }

    const prereqStatuses = prerequisites.map(prereqTitle => {
        const prereqPrompt = allPrompts.find(p => p.title === prereqTitle);
        return {
            title: prereqTitle,
            isComplete: prereqPrompt?.status === "completed" || prereqPrompt?.status === "skipped",
        };
    });

    const allComplete = prereqStatuses.every(p => p.isComplete);

    if (allComplete) {
        return (
            <div className="flex items-center gap-1 text-xs text-emerald-400">
                <Check className="w-3 h-3" />
                Prerequisites complete
            </div>
        );
    }

    const incompleteCount = prereqStatuses.filter(p => !p.isComplete).length;

    return (
        <div className="flex items-center gap-1 text-xs text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            {incompleteCount} prerequisite{incompleteCount > 1 ? "s" : ""} incomplete
        </div>
    );
}
