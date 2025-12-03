"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ChatInterface, Message } from "@/components/workspace/chat-interface";
import { ArtifactViewer, ArtifactFile } from "@/components/workspace/artifact-viewer";
import { Dock } from "@/components/dashboard/layout/Dock";
import { motion, AnimatePresence } from "framer-motion";
import { GripVertical, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FocusMode = "split" | "chat" | "artifact";

export default function WorkspacePage() {
    const params = useParams();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Welcome to the Architect Workspace. I am ready to help you build your vision. What are we building today?",
            timestamp: new Date(),
        },
    ]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [files, setFiles] = useState<ArtifactFile[]>([
        { id: "1", name: "System Architecture.pdf", url: "#", type: "pdf" },
        { id: "2", name: "Database Schema.pdf", url: "#", type: "pdf" },
    ]);

    // Layout State
    const [leftWidth, setLeftWidth] = useState(40); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const [focusMode, setFocusMode] = useState<FocusMode>("split");
    const containerRef = useRef<HTMLDivElement>(null);

    const handleSendMessage = async (text: string) => {
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: text,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setIsProcessing(true);

        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `I've generated a new architectural diagram for "${text}". You can view it in the artifacts panel.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsProcessing(false);

            const newFile: ArtifactFile = {
                id: Date.now().toString(),
                name: `Specification - ${text.slice(0, 10)}...pdf`,
                url: "#",
                type: "pdf"
            };
            setFiles(prev => [...prev, newFile]);
        }, 2000);
    };

    // Resize Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

            // Clamp between 20% and 80%
            setLeftWidth(Math.min(Math.max(newLeftWidth, 20), 80));
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
    }, [isDragging]);

    // Determine actual widths based on focus mode
    const getPanelStyles = () => {
        if (focusMode === "chat") return { left: "100%", right: "0%" };
        if (focusMode === "artifact") return { left: "0%", right: "100%" };
        return { left: `${leftWidth}%`, right: `${100 - leftWidth}%` };
    };

    const styles = getPanelStyles();

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
                className="h-full border-r border-white/5 z-10 relative overflow-hidden pb-24"
            >
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={() => setFocusMode(focusMode === "chat" ? "split" : "chat")}
                        className="p-2 bg-black/50 backdrop-blur text-white/40 hover:text-white rounded-lg transition-colors"
                    >
                        {focusMode === "chat" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
                <ChatInterface
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isProcessing={isProcessing}
                />
            </motion.div>

            {/* Resizer Handle */}
            {focusMode === "split" && (
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

            {/* Right Panel - Artifact */}
            <motion.div
                initial={false}
                animate={{ width: styles.right, opacity: styles.right === "0%" ? 0 : 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full bg-[#0F0F0F] relative overflow-hidden pb-24"
            >
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <button
                        onClick={() => setFocusMode(focusMode === "artifact" ? "split" : "artifact")}
                        className="p-2 bg-black/50 backdrop-blur text-white/40 hover:text-white rounded-lg transition-colors"
                    >
                        {focusMode === "artifact" ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
                <ArtifactViewer files={files} title={`Project #${params.id}`} />
            </motion.div>

            {/* Dock */}
            <Dock position="top" />
        </div>
    );
}
