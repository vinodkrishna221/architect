"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore, Blueprint } from "../store";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface GenerateButtonProps {
    className?: string;
}

export function GenerateButton({ className }: GenerateButtonProps) {
    const [error, setError] = useState<string | null>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const {
        conversationId,
        isComplete,
        suiteId,
        isGenerating,
        generationProgress,
        setSuiteId,
        setBlueprints,
        setGenerating,
        setGenerationProgress,
    } = useWorkspaceStore();

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, []);

    // Poll for blueprint updates
    const pollBlueprints = useCallback(async (suiteIdToPoll: string) => {
        try {
            const res = await fetch(`/api/ai/blueprints/${suiteIdToPoll}`);
            if (!res.ok) {
                throw new Error("Failed to fetch blueprints");
            }

            const data = await res.json();
            const blueprints: Blueprint[] = data.blueprints;

            setBlueprints(blueprints);
            setGenerationProgress(data.suite.completedCount, 6);

            // Check if generation is complete
            if (data.suite.status === "complete" || data.suite.status === "partial" || data.suite.status === "error") {
                setGenerating(false);
                if (pollingRef.current) {
                    clearInterval(pollingRef.current);
                    pollingRef.current = null;
                }
            }
        } catch (err) {
            console.error("Error polling blueprints:", err);
        }
    }, [setBlueprints, setGenerationProgress, setGenerating]);

    // Start generation
    const handleGenerate = async () => {
        if (!conversationId || isGenerating) return;

        setError(null);
        setGenerating(true);
        setGenerationProgress(0, 6);

        try {
            const res = await fetch("/api/ai/generate-suite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to generate blueprints");
            }

            const data = await res.json();
            setSuiteId(data.suiteId);

            // Fetch initial blueprints
            await pollBlueprints(data.suiteId);

            // Start polling for updates (every 3 seconds)
            pollingRef.current = setInterval(() => {
                pollBlueprints(data.suiteId);
            }, 3000);

        } catch (err) {
            console.error("Generation error:", err);
            setError(err instanceof Error ? err.message : "Failed to generate blueprints");
            setGenerating(false);
        }
    };

    // Don't render if interview isn't complete
    if (!isComplete) {
        return null;
    }

    // Already have blueprints generated
    if (suiteId && !isGenerating && generationProgress.completed > 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl", className)}
            >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                    {generationProgress.completed} Blueprints Generated
                </span>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn("space-y-2", className)}
            >
                <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className={cn(
                        "w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all duration-300",
                        isGenerating
                            ? "bg-blue-600/50 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
                    )}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-white">
                                Generating {generationProgress.completed}/{generationProgress.total}...
                            </span>
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 text-white" />
                            <span className="text-white">Generate Blueprints</span>
                        </>
                    )}
                </button>

                {/* Progress Bar */}
                {isGenerating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="relative"
                    >
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                                initial={{ width: "0%" }}
                                animate={{
                                    width: `${(generationProgress.completed / generationProgress.total) * 100}%`,
                                }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <p className="text-center text-xs text-white/40 mt-2">
                            This may take a few minutes...
                        </p>
                    </motion.div>
                )}

                {/* Error State with Retry */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl"
                    >
                        <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                        <button
                            onClick={() => {
                                setError(null);
                                handleGenerate();
                            }}
                            className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors whitespace-nowrap"
                        >
                            Retry
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
