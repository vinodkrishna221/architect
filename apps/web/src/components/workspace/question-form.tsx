"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionFormProps {
    onSubmit: (text: string) => void;
    isProcessing?: boolean;
}

export function QuestionForm({ onSubmit, isProcessing = false }: QuestionFormProps) {
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isProcessing) return;
        onSubmit(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    return (
        <div className="w-full max-w-3xl mx-auto">
            <motion.form
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                    "relative group rounded-2xl border bg-black/60 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-300",
                    isFocused
                        ? "border-blue-500/50 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]"
                        : "border-white/10 shadow-black/50"
                )}
                onSubmit={handleSubmit}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            >
                <div className="relative flex items-end p-3 gap-3">
                    {/* AI Icon / Status */}
                    <div className="pb-2 pl-1">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300",
                            isProcessing
                                ? "bg-blue-500/20 text-blue-400 animate-pulse"
                                : isFocused
                                    ? "bg-blue-500/10 text-blue-400"
                                    : "bg-white/5 text-white/40"
                        )}>
                            <Sparkles className="w-4 h-4" />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="flex-1 py-2">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your architectural vision..."
                            className="w-full bg-transparent border-none text-white placeholder-white/30 resize-none focus:ring-0 min-h-[24px] max-h-[200px] p-0 text-base leading-relaxed scrollbar-hide outline-none"
                            rows={1}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pb-1 pr-1">
                        <button
                            type="submit"
                            disabled={!input.trim() || isProcessing}
                            className={cn(
                                "p-2 rounded-lg flex items-center justify-center transition-all duration-200",
                                input.trim() && !isProcessing
                                    ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-500/20 scale-100"
                                    : "bg-white/5 text-white/20 scale-90"
                            )}
                        >
                            <ArrowUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Bottom decorative line */}
                <div className={cn(
                    "absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transition-opacity duration-500",
                    isFocused ? "opacity-100" : "opacity-0"
                )} />
            </motion.form>

            {/* Helper text */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: isFocused ? 1 : 0.5 }}
                className="flex items-center justify-between mt-3 px-4 text-xs text-white/30 font-mono"
            >
                <div className="flex items-center gap-2">
                    <Command className="w-3 h-3" />
                    <span>Command Palette</span>
                </div>
                <div>
                    <span>Return to send</span>
                    <span className="mx-2">·</span>
                    <span>Shift + Return for new line</span>
                </div>
            </motion.div>
        </div>
    );
}

