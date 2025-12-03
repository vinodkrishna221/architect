"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionForm } from "./question-form";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    messages: Message[];
    onSendMessage: (text: string) => void;
    isProcessing?: boolean;
}

export function ChatInterface({ messages, onSendMessage, isProcessing = false }: ChatInterfaceProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isProcessing]);

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-white/5 relative overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center px-6 bg-black/20 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-sm font-mono text-white/60 tracking-wider">INTERROGATION_CONSOLE</span>
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32"
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{
                                opacity: 0,
                                y: msg.role === "user" ? 50 : 20,
                                scale: 0.95
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1
                            }}
                            transition={{
                                duration: 0.4,
                                ease: [0.23, 1, 0.32, 1] // cubic-bezier for "springy" feel
                            }}
                            className={cn(
                                "flex gap-4 max-w-3xl",
                                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                            )}
                        >
                            {/* Avatar */}
                            <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                msg.role === "assistant"
                                    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                    : "bg-white/5 border-white/10 text-white/40"
                            )}>
                                {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                            </div>

                            {/* Content */}
                            <div className={cn(
                                "rounded-2xl p-4 text-sm leading-relaxed max-w-[80%] shadow-sm",
                                msg.role === "assistant"
                                    ? "bg-white/5 text-white/90 border border-white/5"
                                    : "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                            )}>
                                {msg.content}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                    >
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex items-center gap-1.5 h-[52px]">
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                            />
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                            />
                            <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-blue-400"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                            />
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Floating Input Area */}
            <div className="absolute bottom-6 left-0 w-full px-6 z-20 pointer-events-none">
                <div className="pointer-events-auto">
                    <QuestionForm onSubmit={onSendMessage} isProcessing={isProcessing} />
                </div>
            </div>
        </div>
    );
}
