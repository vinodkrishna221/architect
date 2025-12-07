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
} from "lucide-react";

// Blueprint type order and configuration
const BLUEPRINT_CONFIG = [
    { type: "design-system", title: "Design System", icon: Palette },
    { type: "frontend", title: "Frontend", icon: Layout },
    { type: "backend", title: "Backend", icon: Server },
    { type: "database", title: "Database", icon: Database },
    { type: "security", title: "Security", icon: Shield },
    { type: "mvp-features", title: "MVP Features", icon: ListChecks },
] as const;

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

    // Sort blueprints by defined order
    const sortedBlueprints = useMemo(() => {
        const typeOrder: string[] = BLUEPRINT_CONFIG.map((c) => c.type);
        return [...blueprints].sort(
            (a, b) => typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
        );
    }, [blueprints]);

    // Get current blueprint
    const currentBlueprint = blueprints.find((bp) => bp.type === activeBlueprint);

    // Parse markdown safely
    const renderedContent = useMemo(() => {
        if (!currentBlueprint?.content) return "";
        const rawHtml = marked.parse(currentBlueprint.content) as string;
        return DOMPurify.sanitize(rawHtml);
    }, [currentBlueprint?.content]);

    // Empty state
    if (blueprints.length === 0) {
        return (
            <div className="flex flex-col h-full bg-[#0F0F0F] items-center justify-center">
                <div className="text-center space-y-4">
                    {isGenerating ? (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Generating Blueprints</p>
                                <p className="text-white/50 text-sm mt-1">
                                    {generationProgress.completed}/{generationProgress.total} complete
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10">
                                <FileText className="w-8 h-8 text-white/30" />
                            </div>
                            <div>
                                <p className="text-white/60">No blueprints yet</p>
                                <p className="text-white/40 text-sm mt-1">
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
        <div className="flex flex-col h-full bg-[#0F0F0F] relative overflow-hidden">
            {/* Header with Tabs */}
            <div className="border-b border-white/5 bg-black/20 backdrop-blur-sm shrink-0">
                {/* Progress indicator during generation */}
                {isGenerating && (
                    <div className="px-4 py-2 border-b border-white/5 flex items-center gap-2 text-sm text-blue-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>
                            Generating blueprints... {generationProgress.completed}/{generationProgress.total}
                        </span>
                    </div>
                )}

                {/* Tab Bar */}
                <div className="flex overflow-x-auto scrollbar-hide">
                    {BLUEPRINT_CONFIG.map((config) => {
                        const bp = sortedBlueprints.find((b) => b.type === config.type);
                        const isActive = activeBlueprint === config.type;
                        const Icon = config.icon;

                        return (
                            <button
                                key={config.type}
                                onClick={() => bp && setActiveBlueprint(config.type)}
                                disabled={!bp}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2",
                                    isActive
                                        ? "border-blue-500 text-white bg-white/5"
                                        : bp
                                            ? "border-transparent text-white/50 hover:text-white/70 hover:bg-white/5"
                                            : "border-transparent text-white/20 cursor-not-allowed"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{config.title}</span>
                                {bp && <StatusIcon status={bp.status} />}
                            </button>
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
                                    <p className="text-white/50">Waiting to generate...</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
