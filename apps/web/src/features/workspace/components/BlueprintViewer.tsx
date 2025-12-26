"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useWorkspaceStore } from "../store";
import { cn } from "@/lib/utils";
import {
    FileText,
    Download,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    Palette,
    Layout,
    Server,
    Database,
    Shield,
    ListChecks,
    Copy,
    Check,
    CreditCard,
    Smartphone,
    Bell,
    BarChart3,
    Users,
    Globe,
    Terminal,
    Cpu,
    LucideIcon,
} from "lucide-react";

// Blueprint type icons mapping (supports dynamic types)
const BLUEPRINT_ICONS: Record<string, LucideIcon> = {
    "design-system": Palette,
    "frontend": Layout,
    "backend": Server,
    "database": Database,
    "security": Shield,
    "mvp-features": ListChecks,
    // Dynamic types
    "payment-integration": CreditCard,
    "mobile-architecture": Smartphone,
    "push-notifications": Bell,
    "trust-safety": Shield,
    "api-documentation": FileText,
    "prompt-engineering": Terminal,
    "cli-architecture": Terminal,
    "device-communication": Cpu,
    "real-time-architecture": Globe,
    "notification-system": Bell,
    // Educational types
    "animation-system": Palette,
    "interactive-content": Users,
    "progress-tracking": BarChart3,
};

// Get icon for blueprint type (with fallback)
function getIconForType(type: string): LucideIcon {
    return BLUEPRINT_ICONS[type] || FileText;
}

// Get display title for blueprint type
function getTitleForType(type: string): string {
    const titles: Record<string, string> = {
        "design-system": "Design System",
        "frontend": "Frontend",
        "backend": "Backend",
        "database": "Database",
        "security": "Security",
        "mvp-features": "MVP Features",
        "payment-integration": "Payments",
        "mobile-architecture": "Mobile",
        "push-notifications": "Push Notifications",
        "trust-safety": "Trust & Safety",
        "api-documentation": "API Docs",
        "prompt-engineering": "Prompts",
        "cli-architecture": "CLI",
        "device-communication": "IoT",
        "real-time-architecture": "Real-time",
        "notification-system": "Notifications",
        // Educational types
        "animation-system": "Animations",
        "interactive-content": "Interactive",
        "progress-tracking": "Progress",
    };
    return titles[type] || type.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Status icon component
function StatusIcon({ status }: { status: string }) {
    switch (status) {
        case "complete":
            return <CheckCircle className="w-3.5 h-3.5 text-green-400" />;
        case "generating":
            return <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />;
        case "error":
            return <XCircle className="w-3.5 h-3.5 text-red-400" />;
        default:
            return <Clock className="w-3.5 h-3.5 text-white/30" />;
    }
}

// Download functionality
function downloadAsMarkdown(blueprint: { title: string; content: string; type: string }) {
    const blob = new Blob([blueprint.content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${blueprint.type.toLowerCase().replace(/ /g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

export function BlueprintViewer() {
    const [copied, setCopied] = useState(false);

    const {
        blueprints,
        activeBlueprint,
        setActiveBlueprint,
        isGenerating,
        generationProgress,
        setActiveTab,
    } = useWorkspaceStore();

    // Copy to clipboard functionality
    const copyToClipboard = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    // Auto-select first blueprint when available
    useEffect(() => {
        if (blueprints.length > 0 && !activeBlueprint) {
            setActiveBlueprint(blueprints[0].type);
        }
    }, [blueprints, activeBlueprint, setActiveBlueprint]);

    // Sort blueprints by predefined order, then alphabetically
    const sortedBlueprints = useMemo(() => {
        const coreOrder = ["mvp-features", "design-system", "frontend", "backend", "database", "security"];
        return [...blueprints].sort((a, b) => {
            const aIndex = coreOrder.indexOf(a.type);
            const bIndex = coreOrder.indexOf(b.type);
            // Core types first, then alphabetical
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.type.localeCompare(b.type);
        });
    }, [blueprints]);

    // Get current blueprint
    const currentBlueprint = blueprints.find((bp) => bp.type === activeBlueprint);

    // Parse markdown safely
    const renderedContent = useMemo(() => {
        if (!currentBlueprint?.content) return "";
        const rawHtml = marked.parse(currentBlueprint.content) as string;
        return DOMPurify.sanitize(rawHtml);
    }, [currentBlueprint?.content]);

    // Empty state with premium styling
    if (blueprints.length === 0) {
        return (
            <div className="flex flex-col h-full bg-zinc-950/50 backdrop-blur-sm items-center justify-center">
                <div className="text-center space-y-4">
                    {isGenerating ? (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-500/10 border border-blue-500/30 animate-pulse-glow">
                                <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg tracking-tight">Generating Blueprints</p>
                                <p className="text-white/50 text-sm mt-2">
                                    {generationProgress.total > 0
                                        ? `${generationProgress.completed}/${generationProgress.total} complete`
                                        : "Preparing your technical specifications..."
                                    }
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                <FileText className="w-10 h-10 text-white/30" />
                            </div>
                            <div>
                                <p className="text-white/60 font-medium">No blueprints yet</p>
                                <p className="text-white/40 text-sm mt-2">
                                    Complete the interview to generate blueprints
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-950/50 backdrop-blur-sm relative overflow-hidden">
            {/* Header with Tabs - Premium Glass */}
            <div className="border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
                {/* Progress indicator during generation */}
                {isGenerating && (
                    <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 text-sm text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                            Generating blueprints... {generationProgress.total > 0
                                ? `${generationProgress.completed}/${generationProgress.total}`
                                : ""}
                        </span>
                    </div>
                )}

                {/* Tab Bar - Premium with Animated Indicator */}
                <div className="flex overflow-x-auto scrollbar-hide border-b border-white/5">
                    {sortedBlueprints.map((bp, index) => {
                        const isActive = activeBlueprint === bp.type;
                        const Icon = getIconForType(bp.type);

                        return (
                            <motion.button
                                key={bp.id}
                                onClick={() => setActiveBlueprint(bp.type)}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                className={cn(
                                    "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-all duration-300",
                                    isActive
                                        ? "text-white"
                                        : "text-white/50 hover:text-white/70 hover:bg-white/5"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="blueprintTabIndicator"
                                        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <Icon className="w-4 h-4" />
                                <span>{getTitleForType(bp.type)}</span>
                                <StatusIcon status={bp.status} />
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {currentBlueprint && (
                        <motion.div
                            key={currentBlueprint.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="p-6"
                        >
                            {/* Action buttons */}
                            {currentBlueprint.status === "complete" && (
                                <div className="flex justify-end gap-2 mb-4">
                                    <button
                                        onClick={() => copyToClipboard(currentBlueprint.content)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-all",
                                            copied
                                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                : "bg-white/5 hover:bg-white/10 border-white/10 text-white/70 hover:text-white"
                                        )}
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="w-4 h-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => downloadAsMarkdown(currentBlueprint)}
                                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 hover:text-white transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download .md
                                    </button>
                                </div>
                            )}

                            {/* Content */}
                            {currentBlueprint.status === "complete" && (
                                <div
                                    className="prose prose-invert prose-sm max-w-none
                                        prose-headings:text-white prose-headings:font-semibold
                                        prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3 prose-h1:mb-6
                                        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
                                        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
                                        prose-p:text-white/80 prose-p:leading-relaxed
                                        prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                                        prose-code:text-blue-300 prose-code:bg-blue-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:font-normal
                                        prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-pre:rounded-xl
                                        prose-ul:text-white/80 prose-ol:text-white/80
                                        prose-li:marker:text-white/40
                                        prose-table:border-collapse
                                        prose-th:border prose-th:border-white/10 prose-th:bg-white/5 prose-th:px-3 prose-th:py-2 prose-th:text-left
                                        prose-td:border prose-td:border-white/10 prose-td:px-3 prose-td:py-2
                                        prose-strong:text-white prose-strong:font-semibold
                                        prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:py-1 prose-blockquote:px-4"
                                    dangerouslySetInnerHTML={{ __html: renderedContent }}
                                />
                            )}

                            {currentBlueprint.status === "generating" && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                                    <p className="text-white/60">Generating {currentBlueprint.title}...</p>
                                    <p className="text-white/40 text-sm mt-1">This may take a moment</p>
                                </div>
                            )}

                            {currentBlueprint.status === "error" && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <XCircle className="w-8 h-8 text-red-400 mb-4" />
                                    <p className="text-red-400">Failed to generate {currentBlueprint.title}</p>
                                    <p className="text-white/40 text-sm mt-1">Please try generating again</p>
                                </div>
                            )}

                            {currentBlueprint.status === "pending" && (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <Clock className="w-8 h-8 text-white/30 mb-4" />
                                    <p className="text-white/50">Queued for generation</p>
                                    <p className="text-white/40 text-sm mt-2">
                                        Click &quot;Resume Generation&quot; to continue
                                    </p>
                                </div>
                            )}

                            {/* Start Creating Prompts Button - Show when current blueprint is complete */}
                            {currentBlueprint.status === "complete" && (
                                <div className="mt-12 pt-8 border-t border-white/5 flex justify-center pb-8">
                                    <button
                                        onClick={() => setActiveTab("prompts")}
                                        className="group relative px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center gap-2"
                                    >
                                        <span>Start Creating Prompts</span>
                                        <Terminal className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
