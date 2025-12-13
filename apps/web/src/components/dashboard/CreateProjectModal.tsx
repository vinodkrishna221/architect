"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Sparkles, ChevronDown } from "lucide-react";
import { useDashboardStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// Project types for dynamic PRD generation
const PROJECT_TYPES = [
    { value: "saas", label: "SaaS", description: "Web app with subscriptions" },
    { value: "marketplace", label: "Marketplace", description: "Two-sided platform" },
    { value: "mobile", label: "Mobile App", description: "iOS/Android application" },
    { value: "ecommerce", label: "E-commerce", description: "Online store" },
    { value: "internal", label: "Internal Tool", description: "Business operations" },
    { value: "api", label: "API/Developer Tool", description: "Developer platform" },
    { value: "ai-product", label: "AI Product", description: "AI/ML powered app" },
    { value: "cli", label: "CLI Tool", description: "Command-line tool" },
    { value: "iot", label: "IoT", description: "Hardware/connected devices" },
    { value: "educational", label: "Educational", description: "Interactive learning platform" },
] as const;

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [projectType, setProjectType] = useState("saas");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const { createProject, credits } = useDashboardStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        setIsSubmitting(true);
        setError("");

        const project = await createProject(title.trim(), description.trim(), projectType);

        if (project) {
            toast.success("Project created!", {
                description: `"${title.trim()}" is ready to go`,
            });
            onClose();
            setTitle("");
            setDescription("");
            setProjectType("saas");
            // Navigate to the new project workspace
            router.push(`/project/${project.id}`);
        } else {
            const errorMsg = credits <= 0
                ? "Insufficient credits. Check pricing for more."
                : "Failed to create project. Please try again.";
            toast.error("Creation failed", {
                description: errorMsg,
            });
            setError(errorMsg);
        }

        setIsSubmitting(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">New Project</h2>
                                        <p className="text-xs text-zinc-500 font-mono">
                                            {credits.toFixed(1)} CREDITS_AVAILABLE
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label htmlFor="title" className="block text-xs font-mono text-zinc-400 mb-2 tracking-wider">
                                        PROJECT_TITLE *
                                    </label>
                                    <input
                                        id="title"
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g., AI Code Reviewer"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-xs font-mono text-zinc-400 mb-2 tracking-wider">
                                        DESCRIPTION (OPTIONAL)
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Brief description of your project idea..."
                                        rows={2}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all resize-none"
                                    />
                                </div>

                                {/* Project Type Selector */}
                                <div>
                                    <label htmlFor="projectType" className="block text-xs font-mono text-zinc-400 mb-2 tracking-wider">
                                        PROJECT_TYPE *
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="projectType"
                                            value={projectType}
                                            onChange={(e) => setProjectType(e.target.value)}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        >
                                            {PROJECT_TYPES.map((type) => (
                                                <option key={type.value} value={type.value} className="bg-zinc-900">
                                                    {type.label} - {type.description}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1.5">
                                        This determines which PRD documents will be generated
                                    </p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || credits <= 0}
                                        className="flex-1 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Project"
                                        )}
                                    </button>
                                </div>

                                {credits <= 0 && (
                                    <p className="text-center text-xs text-amber-400">
                                        Insufficient credits. Check pricing for more!
                                    </p>
                                )}
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
