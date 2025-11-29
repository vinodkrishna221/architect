"use client";

import { useDashboardStore } from "@/lib/store";
import { MOCK_PROJECTS } from "@/lib/mock-data";
import { X } from "lucide-react";

export function ProjectView() {
    const { activeProjectId, closeProject } = useDashboardStore();
    const project = MOCK_PROJECTS.find(p => p.id === activeProjectId);

    if (!project) return null;

    return (
        <div className="w-full h-full flex flex-col bg-zinc-900/30">
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20">
                <div>
                    <h2 className="text-xl font-bold">{project.title}</h2>
                    <p className="text-xs font-mono text-zinc-500">{project.id}</p>
                </div>
                <button
                    onClick={() => closeProject(project.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex items-center justify-center text-zinc-500 font-mono">
                [ PROJECT_WORKSPACE_PLACEHOLDER ]
            </div>
        </div>
    );
}
