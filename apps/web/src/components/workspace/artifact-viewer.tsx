"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, ExternalLink, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ArtifactFile {
    id: string;
    name: string;
    url: string; // In a real app, this would be the PDF URL
    type: "pdf";
}

interface ArtifactViewerProps {
    files?: ArtifactFile[];
    title?: string;
}

export function ArtifactViewer({
    files = [],
    title = "Project Artifacts"
}: ArtifactViewerProps) {
    const [activeFileId, setActiveFileId] = useState<string>(files[0]?.id || "");
    const [zoom, setZoom] = useState(100);

    const activeFile = files.find(f => f.id === activeFileId) || files[0];

    return (
        <div className="flex flex-col h-full bg-[#0F0F0F] relative overflow-hidden">
            {/* Header / Toolbar */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 bg-black/20 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
                    {/* File Tabs */}
                    <div className="flex items-center gap-1">
                        {files.map((file) => (
                            <button
                                key={file.id}
                                onClick={() => setActiveFileId(file.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-t-lg text-xs font-medium transition-all duration-200 flex items-center gap-2 border-b-2",
                                    activeFileId === file.id
                                        ? "bg-white/5 text-white border-blue-500"
                                        : "text-white/40 hover:text-white/60 border-transparent hover:bg-white/5"
                                )}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                {file.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pl-4 border-l border-white/5">
                    <div className="flex items-center gap-1 mr-2 bg-white/5 rounded-lg p-0.5">
                        <button
                            onClick={() => setZoom(z => Math.max(50, z - 10))}
                            className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                        >
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono text-white/40 w-12 text-center">{zoom}%</span>
                        <button
                            onClick={() => setZoom(z => Math.min(200, z + 10))}
                            className="p-1.5 hover:bg-white/10 rounded-md text-white/60 hover:text-white transition-colors"
                        >
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white transition-colors">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area - PDF Viewer Simulation */}
            <div className="flex-1 overflow-hidden relative bg-[#1A1A1A] flex items-center justify-center p-8">
                <AnimatePresence mode="wait">
                    {activeFile ? (
                        <motion.div
                            key={activeFile.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full max-w-4xl bg-white shadow-2xl overflow-hidden flex flex-col"
                            style={{ transform: `scale(${zoom / 100})` }}
                        >
                            {/* Fake PDF Header */}
                            <div className="h-12 bg-gray-100 border-b flex items-center justify-between px-4 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">PDF</div>
                                    <span className="text-sm font-medium text-gray-700">{activeFile.name}</span>
                                </div>
                                <div className="text-xs text-gray-400">Page 1 / 5</div>
                            </div>

                            {/* Fake PDF Content */}
                            <div className="flex-1 overflow-auto p-8 bg-white relative">
                                {/* Skeleton Content */}
                                <div className="space-y-6 max-w-2xl mx-auto">
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-8" />

                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                                    </div>

                                    <div className="h-40 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center">
                                        <span className="text-gray-400 text-sm">Diagram / Chart Placeholder</span>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                        <div className="h-4 bg-gray-100 rounded w-11/12" />
                                        <div className="h-4 bg-gray-100 rounded w-full" />
                                    </div>
                                </div>

                                {/* Watermark/Overlay for demo */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                                    <span className="text-6xl font-bold -rotate-45">PREVIEW</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center text-white/40">
                            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No document selected</p>
                        </div>
                    )}
                </AnimatePresence>

                {/* Background Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </div>
        </div>
    );
}
