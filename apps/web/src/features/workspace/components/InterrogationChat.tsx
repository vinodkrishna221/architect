"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWorkspaceStore } from "../store";
import { cn } from "@/lib/utils";
import { Bot, User, ArrowUp, Sparkles, CheckCircle, Loader2 } from "lucide-react";

// SSE event data types
interface SSEStartData {
    conversationId: string;
    questionsAsked: number;
}

interface SSEChunkData {
    content: string;
}

interface SSEDoneData {
    question: string;
    category: "users" | "problem" | "technical" | "scope";
    isComplete: boolean;
    completionReason?: string | null;
    questionsAsked: number;
}

interface SSEErrorData {
    error: string;
    message?: string;
    remainingCredits?: number;
}

type SSEData = SSEStartData | SSEChunkData | SSEDoneData | SSEErrorData;

interface InterrogationChatProps {
    projectId: string;
}

export function InterrogationChat({ projectId }: InterrogationChatProps) {
    const [input, setInput] = useState("");
    const [initialDescription, setInitialDescription] = useState("");
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        conversationId,
        messages,
        isComplete,
        isLoading,
        isStreaming,
        questionsAsked,
        setConversationId,
        addMessage,
        setComplete,
        setLoading,
        setQuestionsAsked,
        loadConversation,
        startStreamingMessage,
        updateStreamingMessage,
        finalizeStreamingMessage,
    } = useWorkspaceStore();

    // Load existing conversation on mount
    useEffect(() => {
        const loadExistingConversation = async () => {
            try {
                const res = await fetch(`/api/ai/conversation/${projectId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.exists) {
                        // Load existing conversation into store
                        loadConversation({
                            conversationId: data.conversationId,
                            messages: data.messages,
                            questionsAsked: data.questionsAsked,
                            isComplete: data.isComplete,
                            suiteId: data.suiteId,
                            blueprints: data.blueprints,
                        });
                    }
                }
            } catch (error) {
                console.error("Failed to load conversation:", error);
            } finally {
                setIsInitialLoading(false);
            }
        };
        loadExistingConversation();
    }, [projectId, loadConversation]);

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    // Sync conversation state when tab regains focus (resilience for tab-switching)
    const syncConversation = useCallback(async () => {
        if (!conversationId || isLoading || isStreaming) return;
        try {
            const res = await fetch(`/api/ai/conversation/${projectId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.exists) {
                    loadConversation({
                        conversationId: data.conversationId,
                        messages: data.messages,
                        questionsAsked: data.questionsAsked,
                        isComplete: data.isComplete,
                        suiteId: data.suiteId,
                        blueprints: data.blueprints,
                    });
                }
            }
        } catch (error) {
            console.error("Failed to sync conversation:", error);
        }
    }, [conversationId, projectId, isLoading, isStreaming, loadConversation]);

    useEffect(() => {
        const handleFocus = () => {
            syncConversation();
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [syncConversation]);

    // Parse SSE events from a chunk of text
    const parseSSEEvents = (text: string): Array<{ event: string; data: SSEData }> => {
        const events: Array<{ event: string; data: SSEData }> = [];
        const lines = text.split("\n");
        let currentEvent = "";
        let currentData = "";

        for (const line of lines) {
            if (line.startsWith("event: ")) {
                currentEvent = line.slice(7);
            } else if (line.startsWith("data: ")) {
                currentData = line.slice(6);
            } else if (line === "" && currentEvent && currentData) {
                try {
                    events.push({ event: currentEvent, data: JSON.parse(currentData) });
                } catch {
                    console.warn("Failed to parse SSE data:", currentData);
                }
                currentEvent = "";
                currentData = "";
            }
        }
        return events;
    };

    const startConversation = async () => {
        if (!initialDescription.trim() || isLoading) return;

        setLoading(true);
        startStreamingMessage();

        try {
            const res = await fetch("/api/ai/interrogate-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, initialDescription }),
            });

            if (!res.ok || !res.body) {
                throw new Error("Failed to start interview");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let receivedConversationId = "";
            let finalCategory: "users" | "problem" | "technical" | "scope" | undefined;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = parseSSEEvents(buffer);
                buffer = ""; // Clear buffer after parsing

                for (const { event, data } of events) {
                    switch (event) {
                        case "start":
                            receivedConversationId = (data as SSEStartData).conversationId;
                            setConversationId(receivedConversationId);
                            break;
                        case "chunk":
                            updateStreamingMessage((data as SSEChunkData).content);
                            break;
                        case "done": {
                            const doneData = data as SSEDoneData;
                            finalCategory = doneData.category;
                            setQuestionsAsked(doneData.questionsAsked);
                            if (doneData.isComplete) {
                                setComplete(true);
                            }
                            break;
                        }
                        case "error":
                            throw new Error((data as SSEErrorData).error || "Stream error");
                    }
                }
            }

            finalizeStreamingMessage(finalCategory);
        } catch (error) {
            console.error("Failed to start conversation:", error);
            finalizeStreamingMessage();
            addMessage({
                role: "assistant",
                content: "Sorry, something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const sendAnswer = async () => {
        if (!input.trim() || isLoading || !conversationId) return;

        const userMessage = input.trim();
        setInput("");
        addMessage({ role: "user", content: userMessage });
        setLoading(true);
        startStreamingMessage();

        try {
            const res = await fetch("/api/ai/interrogate-stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, userMessage }),
            });

            if (!res.ok || !res.body) {
                throw new Error("Failed to send answer");
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let finalCategory: "users" | "problem" | "technical" | "scope" | undefined;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const events = parseSSEEvents(buffer);
                buffer = "";

                for (const { event, data } of events) {
                    switch (event) {
                        case "chunk":
                            updateStreamingMessage((data as SSEChunkData).content);
                            break;
                        case "done": {
                            const doneData = data as SSEDoneData;
                            finalCategory = doneData.category;
                            setQuestionsAsked(doneData.questionsAsked);
                            if (doneData.isComplete) {
                                setComplete(true);
                            }
                            break;
                        }
                        case "error":
                            throw new Error((data as SSEErrorData).error || "Stream error");
                    }
                }
            }

            finalizeStreamingMessage(finalCategory);
        } catch (error) {
            console.error("Failed to send answer:", error);
            finalizeStreamingMessage();
            addMessage({
                role: "assistant",
                content: "Sorry, something went wrong. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (conversationId) {
                sendAnswer();
            } else {
                startConversation();
            }
        }
    };

    // Show loading state while checking for existing conversation
    if (isInitialLoading) {
        return (
            <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-white/5">
                <div className="h-14 border-b border-white/5 flex items-center px-6 bg-black/20 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
                        <span className="text-sm font-mono text-white/60 tracking-wider">LOADING...</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
            </div>
        );
    }

    // Initial description input screen (only show if no existing conversation)
    if (!conversationId) {
        return (
            <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-white/5">
                {/* Header */}
                <div className="h-14 border-b border-white/5 flex items-center px-6 bg-black/20 backdrop-blur-sm shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]" />
                        <span className="text-sm font-mono text-white/60 tracking-wider">WAITING_FOR_INPUT</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-2xl space-y-6">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
                                <Sparkles className="w-8 h-8 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-semibold text-white mb-2">Describe Your Vision</h2>
                            <p className="text-white/50">
                                Tell me about your project, and I&apos;ll ask the right questions to help you build it.
                            </p>
                        </div>

                        <div className="relative">
                            <textarea
                                value={initialDescription}
                                onChange={(e) => setInitialDescription(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="I want to build a platform that..."
                                className="w-full h-40 p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 resize-none focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                            />
                        </div>

                        <button
                            onClick={startConversation}
                            disabled={isLoading || !initialDescription.trim()}
                            className={cn(
                                "w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2",
                                initialDescription.trim() && !isLoading
                                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20"
                                    : "bg-white/5 text-white/30 cursor-not-allowed"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Starting Interview...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Start Interview
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Chat interface
    return (
        <div className="flex flex-col h-full bg-[#0A0A0A] border-r border-white/5 relative overflow-hidden">
            {/* Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "w-2 h-2 rounded-full shadow-lg",
                        isComplete
                            ? "bg-green-500 shadow-green-500/50"
                            : "bg-blue-500 shadow-blue-500/50 animate-pulse"
                    )} />
                    <span className="text-sm font-mono text-white/60 tracking-wider">
                        {isComplete ? "INTERVIEW_COMPLETE" : "INTERROGATION_ACTIVE"}
                    </span>
                </div>
                <div className="text-xs text-white/40 font-mono">
                    Q{questionsAsked}/15
                </div>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pb-32"
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
                                ease: [0.23, 1, 0.32, 1]
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
                                {msg.category && msg.role === "assistant" && (
                                    <div className="mt-2 text-xs text-white/30 uppercase tracking-wider">
                                        {msg.category}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Loading Indicator */}
                {isLoading && (
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

                {/* Completion Banner */}
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3"
                    >
                        <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                        <div>
                            <p className="text-green-400 font-medium">Interview Complete!</p>
                            <p className="text-green-400/60 text-sm">
                                Ready to generate your blueprints. Click the button below.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Input Area */}
            {!isComplete && (
                <div className="absolute bottom-6 left-0 w-full px-6 z-20 pointer-events-none">
                    <div className="pointer-events-auto">
                        <div
                            className={cn(
                                "relative group rounded-2xl border bg-black/60 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300",
                                "border-white/10 shadow-black/50 focus-within:border-blue-500/50 focus-within:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
                            )}
                        >
                            <div className="relative flex items-end p-3 gap-3">
                                <div className="pb-2 pl-1">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                                        isLoading
                                            ? "bg-blue-500/20 text-blue-400 animate-pulse"
                                            : "bg-white/5 text-white/40"
                                    )}>
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="flex-1 py-2">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Type your answer..."
                                        className="w-full bg-transparent border-none text-white placeholder-white/30 resize-none focus:ring-0 min-h-[24px] max-h-[200px] p-0 text-base leading-relaxed scrollbar-hide outline-none"
                                        rows={1}
                                        disabled={isLoading}
                                    />
                                </div>

                                <div className="pb-1 pr-1">
                                    <button
                                        type="button"
                                        onClick={sendAnswer}
                                        disabled={!input.trim() || isLoading}
                                        className={cn(
                                            "p-2 rounded-lg flex items-center justify-center transition-all duration-200",
                                            input.trim() && !isLoading
                                                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 scale-100"
                                                : "bg-white/5 text-white/20 scale-90"
                                        )}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
