"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { GripVertical, Maximize2, Minimize2, MessageSquare, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dock } from "@/components/dashboard/layout/Dock";
import {
    InterrogationChat,
    BlueprintViewer,
    GenerateButton,
    useWorkspaceStore,
} from "@/features/workspace";

type FocusMode = "split" | "chat" | "blueprint";
type MobileTab = "chat" | "blueprints";

export default function WorkspacePage() {
    const params = useParams();
    const projectId = params.id as string;

    // Layout State
    const [leftWidth, setLeftWidth] = useState(45);
    const [isDragging, setIsDragging] = useState(false);
    const [focusMode, setFocusMode] = useState<FocusMode>("split");
    const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Workspace store state
    const { isComplete, blueprints, reset } = useWorkspaceStore();

    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Reset workspace state when project changes
    useEffect(() => {
        reset();
    }, [projectId, reset]);

    // Resize Handlers (desktop only)
    const handleMouseDown = (e: React.MouseEvent) => {
        if (isMobile) return;
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        if (isMobile) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp between 25% and 75%
            setLeftWidth(Math.min(Math.max(newLeftWidth, 25), 75));
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, isMobile]);

    // Determine actual widths based on focus mode (desktop)
    const getPanelStyles = () => {
        if (focusMode === "chat") return { left: "100%", right: "0%" };
        if (focusMode === "blueprint") return { left: "0%", right: "100%" };
        return { left: `${leftWidth}%`, right: `${100 - leftWidth}%` };
    };

    const styles = getPanelStyles();

    // Show blueprints panel after interview is complete and we have blueprints
    const showBlueprints = isComplete || blueprints.length > 0;

    // Mobile Layout
    if (isMobile) {
        return (
            <div className="flex flex-col h-screen w-full bg-black overflow-hidden font-sans relative">
                {/* Mobile Tab Bar */}
                <div className="flex border-b border-white/10 bg-black/50 backdrop-blur-sm z-20 shrink-0">
                    <button
                        onClick={() => setMobileTab("chat")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                            mobileTab === "chat"
                                ? "text-white border-b-2 border-blue-500 bg-white/5"
                                : "text-white/50"
                        )}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Interview
                    </button>
                    <button
                        onClick={() => setMobileTab("blueprints")}
                        disabled={!showBlueprints}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors",
                            mobileTab === "blueprints"
                                ? "text-white border-b-2 border-blue-500 bg-white/5"
                                : showBlueprints
                                    ? "text-white/50"
                                    : "text-white/20 cursor-not-allowed"
                        )}
                    >
                        <FileText className="w-4 h-4" />
                        Blueprints
                        {blueprints.length > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {blueprints.filter(b => b.status === "complete").length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Mobile Content */}
                <div className="flex-1 overflow-hidden relative">
                    {mobileTab === "chat" ? (
                        <div className="h-full flex flex-col">
                            <div className="flex-1 overflow-hidden">
                                <InterrogationChat projectId={projectId} />
                            </div>
                            {isComplete && (
                                <div className="p-4 border-t border-white/5 bg-black/20">
                                    <GenerateButton />
                                </div>
                            )}
                        </div>
                    ) : (
                        <BlueprintViewer />
                    )}
                </div>

                {/* Dock */}
                <Dock position="top" />
            </div>
        );
    }

    // Desktop Layout
    return (
        <div
            ref={containerRef}
            className={cn(
                "flex h-screen w-full bg-black overflow-hidden font-sans relative",
                isDragging ? "cursor-col-resize select-none" : ""
            )}
        >
            {/* Left Panel - Chat */}
            <motion.div
                initial={false}
                animate={{ width: styles.left, opacity: styles.left === "0%" ? 0 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full border-r border-white/5 z-10 relative overflow-hidden flex flex-col"
            >
                {/* Maximize/Minimize Button */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setFocusMode(focusMode === "chat" ? "split" : "chat")}
                        className="p-2 bg-black/50 backdrop-blur text-white/40 hover:text-white rounded-lg transition-colors"
                    >
                        {focusMode === "chat" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Interrogation Chat */}
                <div className="flex-1 overflow-hidden">
                    <InterrogationChat projectId={projectId} />
                </div>

                {/* Generate Button - appears when interview is complete */}
                {isComplete && (
                    <div className="p-4 border-t border-white/5 bg-black/20">
                        <GenerateButton />
                    </div>
                )}
            </motion.div>

            {/* Resizer Handle */}
            {focusMode === "split" && showBlueprints && (
                <div
                    className="w-1 h-full bg-transparent hover:bg-blue-500/50 active:bg-blue-500 cursor-col-resize z-20 absolute transition-colors flex items-center justify-center group"
                    style={{ left: `${leftWidth}%`, transform: "translateX(-50%)" }}
                    onMouseDown={handleMouseDown}
                >
                    <div className="h-8 w-4 bg-black/80 border border-white/10 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3 h-3 text-white/40" />
                    </div>
                </div>
            )}

            {/* Right Panel - Blueprint Viewer */}
            {showBlueprints && (
                <motion.div
                    initial={false}
                    animate={{ width: styles.right, opacity: styles.right === "0%" ? 0 : 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="h-full bg-[#0F0F0F] relative overflow-hidden"
                >
                    {/* Maximize/Minimize Button */}
                    <div className="absolute top-4 right-4 z-50 flex gap-2">
                        <button
                            onClick={() => setFocusMode(focusMode === "blueprint" ? "split" : "blueprint")}
                            className="p-2 bg-black/50 backdrop-blur text-white/40 hover:text-white rounded-lg transition-colors"
                        >
                            {focusMode === "blueprint" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>
                    </div>

                    <BlueprintViewer />
                </motion.div>
            )}

            {/* Dock */}
            <Dock position="top" />
        </div>
    );
}

