"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore, Blueprint } from "../store";
import { cn } from "@/lib/utils";
import { Sparkles, Loader2, CheckCircle, AlertCircle, Play, RotateCcw, Info } from "lucide-react";

interface GenerateButtonProps {
    className?: string;
}

// Suite status response from check-suite API
interface SuiteStatus {
    hasExisting: boolean;
    status: "generating" | "complete" | "partial" | "error" | null;
    pendingCount: number;
    failedCount: number;
    completedCount: number;
    generatingCount: number;
    totalCount: number;
    suiteId: string | null;
}

export function GenerateButton({ className }: GenerateButtonProps) {
    const [error, setError] = useState<string | null>(null);
    const [suiteStatus, setSuiteStatus] = useState<SuiteStatus | null>(null);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
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

    // Check for existing suite status on mount
    useEffect(() => {
        if (conversationId && isComplete && !isGenerating) {
            checkSuiteStatus();
        }
    }, [conversationId, isComplete, isGenerating]);

    // Check suite status from backend
    const checkSuiteStatus = async () => {
        if (!conversationId) return;

        setIsCheckingStatus(true);
        try {
            const res = await fetch(`/api/ai/check-suite?conversationId=${conversationId}`);
            if (res.ok) {
                const data: SuiteStatus = await res.json();
                setSuiteStatus(data);

                // If there's an existing suite, also fetch blueprints
                if (data.hasExisting && data.suiteId) {
                    setSuiteId(data.suiteId);
                    setGenerationProgress(data.completedCount, data.totalCount);

                    // Fetch actual blueprints for display
                    const bpRes = await fetch(`/api/ai/blueprints/${data.suiteId}`);
                    if (bpRes.ok) {
                        const bpData = await bpRes.json();
                        setBlueprints(bpData.blueprints);
                    }
                }
            }
        } catch (err) {
            console.error("Error checking suite status:", err);
        } finally {
            setIsCheckingStatus(false);
        }
    };

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
            setGenerationProgress(data.suite.completedCount, data.suite.totalCount);

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
        // Don't set initial progress here - wait for API response with dynamic totalCount

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

            // Check if this is an existing suite (no charge was made)
            if (data.isExisting) {
                // Just set progress from existing data, no need to poll
                setGenerationProgress(data.completedCount, data.totalCount);
                if (data.status === "complete" || data.status === "partial") {
                    setGenerating(false);
                    // Fetch blueprints once
                    await pollBlueprints(data.suiteId);
                    return;
                }
            } else {
                // New generation - set initial progress
                setGenerationProgress(0, data.totalCount);
            }

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

    // Loading state while checking suite status
    if (isCheckingStatus) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={cn("flex items-center justify-center gap-2 px-4 py-3 bg-white/5 rounded-xl", className)}
            >
                <Loader2 className="w-4 h-4 text-white/50 animate-spin" />
                <span className="text-white/50 text-sm">Checking status...</span>
            </motion.div>
        );
    }

    // Determine button state based on suite status
    const hasExisting = suiteStatus?.hasExisting;
    const pendingCount = suiteStatus?.pendingCount || 0;
    const failedCount = suiteStatus?.failedCount || 0;
    const completedCount = suiteStatus?.completedCount || generationProgress.completed;
    const isResumeMode = hasExisting && (pendingCount > 0 || failedCount > 0);
    const isAllComplete = hasExisting && pendingCount === 0 && failedCount === 0 && completedCount > 0;

    // Already have all blueprints generated successfully
    if (isAllComplete && !isGenerating) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl", className)}
            >
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">
                    {completedCount} Blueprints Generated
                </span>
            </motion.div>
        );
    }

    // Get button content based on mode
    const getButtonContent = () => {
        if (isGenerating) {
            return (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-white">
                        {generationProgress.total > 0
                            ? `Generating ${generationProgress.completed}/${generationProgress.total}...`
                            : "Preparing..."
                        }
                    </span>
                </>
            );
        }

        if (isResumeMode) {
            const pendingText = pendingCount > 0 ? `${pendingCount} pending` : "";
            const failedText = failedCount > 0 ? `${failedCount} failed` : "";
            const resumeText = [pendingText, failedText].filter(Boolean).join(", ");

            return (
                <>
                    <Play className="w-5 h-5 text-white" />
                    <span className="text-white">Resume Generation ({resumeText})</span>
                </>
            );
        }

        return (
            <>
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white">Generate Blueprints</span>
            </>
        );
    };

    // Get info text based on mode
    const getInfoText = () => {
        if (isGenerating) return null;

        if (isResumeMode) {
            return (
                <div className="flex items-center gap-2 text-xs text-white/40">
                    <Info className="w-3 h-3" />
                    <span>Continue from where you left off (no additional cost)</span>
                </div>
            );
        }

        return (
            <div className="flex items-center gap-2 text-xs text-white/40">
                <Info className="w-3 h-3" />
                <span>Uses 3 credits to generate your PRD documents</span>
            </div>
        );
    };

    // Get button gradient based on mode
    const getButtonGradient = () => {
        if (isGenerating) return "bg-blue-600/50 cursor-not-allowed";
        if (isResumeMode) {
            return "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40";
        }
        return "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40";
    };

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
                        getButtonGradient()
                    )}
                >
                    {getButtonContent()}
                </button>

                {/* Info Text */}
                {getInfoText() && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-center"
                    >
                        {getInfoText()}
                    </motion.div>
                )}

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
                                    width: `${generationProgress.total > 0 ? (generationProgress.completed / generationProgress.total) * 100 : 0}%`,
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

