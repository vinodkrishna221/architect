"use client";

import { useDashboardStore } from "@/lib/store";
import { X, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "../shared/StatusBadge";

export function ProjectView() {
    const { activeProjectId, projects, closeProject } = useDashboardStore();
    const router = useRouter();

    const project = projects.find(p => p.id === activeProjectId);

    if (!project) return null;

    const handleOpenWorkspace = () => {
        router.push(`/project/${project.id}`);
    };

    return (
        <div className="w-full h-full flex flex-col bg-zinc-900/30">
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/20">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">{project.title}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs font-mono text-zinc-500">{project.id}</p>
                            <StatusBadge status={project.status} />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleOpenWorkspace}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors text-white text-sm font-medium"
                    >
                        Open Workspace
                        <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => closeProject(project.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-white/10 flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">📋</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Project Overview</h3>
                    <p className="text-zinc-500 mb-6">
                        {project.description || "No description yet. Open the workspace to start building!"}
                    </p>
                    <button
                        onClick={handleOpenWorkspace}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium transition-colors"
                    >
                        Open Workspace →
                    </button>
                </div>
            </div>
        </div>
    );
}
