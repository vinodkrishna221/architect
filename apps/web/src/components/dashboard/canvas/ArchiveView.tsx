"use client";

import { useState } from "react";
import { MOCK_PROJECTS, Project } from "@/lib/mock-data";
import { useDashboardStore } from "@/lib/store";
import { StatusBadge } from "../shared/StatusBadge";
import { Search, ChevronDown, MoreHorizontal, Lock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";

export function ArchiveView() {
    const [search, setSearch] = useState("");
    const { openProject } = useDashboardStore();

    const filteredProjects = MOCK_PROJECTS.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full h-full flex flex-col px-12 py-8 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex items-end justify-between mb-8"
            >
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-5xl font-black tracking-tighter text-white">PROJECT_ARCHIVE</h1>
                        <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-emerald-500 tracking-wider">SYSTEM ONLINE</span>
                        </div>
                    </div>
                    <p className="text-zinc-500 font-mono text-sm tracking-widest">
                        /// {filteredProjects.length} BLUEPRINTS FOUND
                    </p>
                </div>

                {/* Controls */}
                {/* Floating Control Deck */}
                <div className="flex items-center gap-0 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-xl ring-1 ring-white/5">
                    <div className="relative group border-r border-white/5 pr-2">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="SEARCH_ARCHIVE..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent border-none rounded-xl pl-10 pr-4 py-2 text-sm font-mono focus:outline-none focus:ring-0 text-white placeholder:text-zinc-600 w-64"
                        />
                    </div>

                    <motion.button
                        whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono text-zinc-400 hover:text-white transition-colors"
                    >
                        SORT: NEWEST
                        <ChevronDown className="w-3 h-3" />
                    </motion.button>
                </div>
            </motion.div>

            {/* Table Header */}
            {/* Technical Grid Headers */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-white/10 text-[10px] font-mono text-zinc-600 tracking-widest select-none">
                <div className="col-span-5">:: PROJECT_NAME</div>
                <div className="col-span-2">:: STATUS</div>
                <div className="col-span-3">:: LAST_UPDATED</div>
                <div className="col-span-2 text-right">:: ACTIONS</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-24 pt-2 px-2 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {filteredProjects.map((project, i) => (
                    <ArchiveRow key={project.id} project={project} index={i} onClick={() => openProject(project.id)} />
                ))}
            </div>
        </div>
    );
}

function ArchiveRow({ project, index, onClick }: { project: Project, index: number, onClick: () => void }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <motion.div
            initial={{ opacity: 0, rotateX: -90, y: 50 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            transition={{
                delay: index * 0.05,
                type: "spring",
                stiffness: 50,
                damping: 20,
                mass: 1.5
            }}
            onClick={onClick}
            onMouseMove={handleMouseMove}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="grid grid-cols-12 gap-4 px-4 py-4 border-b border-white/5 cursor-pointer group items-center relative overflow-hidden rounded-xl transition-all duration-500 hover:bg-white/[0.02]"
        >
            {/* Glass Shimmer on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out pointer-events-none" />

            {/* Holographic Border Glow */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: useMotionTemplate`
                        radial-gradient(
                            350px circle at ${mouseX}px ${mouseY}px,
                            rgba(255, 255, 255, 0.1),
                            transparent 80%
                        )
                    `
                }}
            />

            <div className="col-span-5 flex items-center gap-3 relative z-10">
                <div className="w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-blue-500 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-500" />
                <span className="font-bold text-white text-base tracking-tight group-hover:text-blue-200 transition-colors duration-300">
                    {project.title}
                </span>
            </div>

            <div className="col-span-2 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                <StatusBadge status={project.status} />
            </div>

            <div className="col-span-3 text-xs font-mono text-zinc-600 group-hover:text-zinc-400 transition-colors duration-300 relative z-10">
                {formatDistanceToNow(project.updatedAt, { addSuffix: true }).toUpperCase()}
            </div>

            <div className="col-span-2 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 relative z-10">
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
                    <Lock className="w-4 h-4" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}
