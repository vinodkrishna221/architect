"use client";

import { useRef, useState } from "react";
import { MotionValue, motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useDashboardStore } from "@/lib/store";
import { ProjectIcon } from "../shared/ProjectIcon";
import { LayoutGrid, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DockProps {
    position?: "bottom" | "top";
}

export function Dock({ position = "bottom" }: DockProps) {
    const mouseX = useMotionValue(Infinity);
    const { dockItems, activeProjectId, openProject, minimizeProject } = useDashboardStore();
    const router = useRouter();

    const handleNewProject = () => {
        const newProjectId = Date.now().toString();
        router.push(`/project/${newProjectId}`);
    };

    return (
        <motion.div
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            className={cn(
                "fixed left-1/2 -translate-x-1/2 h-16 px-4 pb-3 rounded-2xl bg-black/80 backdrop-blur-2xl border border-white/10 ring-1 ring-white/5 flex items-end gap-4 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)] z-50",
                position === "bottom" ? "bottom-6" : "top-6"
            )}
        >
            {/* Top Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            {/* Home / Archive */}
            <DockItem mouseX={mouseX} onClick={minimizeProject} isActive={!activeProjectId} label="Home" position={position}>
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl border border-white/10">
                    <LayoutGrid className="w-5 h-5 text-zinc-400" />
                </div>
            </DockItem>

            {/* Glass Divider */}
            <div className="h-8 w-1.5 rounded-full bg-white/5 border-x border-white/5 mb-2 mx-1" />

            {/* Active Projects */}
            {dockItems.map((project) => (
                <DockItem
                    key={project.id}
                    mouseX={mouseX}
                    onClick={() => openProject(project.id)}
                    isActive={activeProjectId === project.id}
                    label={project.title}
                    position={position}
                >
                    <ProjectIcon id={project.id} className="w-full h-full rounded-xl" />
                </DockItem>
            ))}

            {/* New Project */}
            <DockItem mouseX={mouseX} onClick={handleNewProject} label="New Project" position={position}>
                <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 rounded-xl border border-blue-500/30 border-dashed hover:border-solid hover:border-blue-400 hover:bg-blue-500/10 transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                    <Plus className="w-5 h-5 text-blue-400/70 group-hover:text-blue-400" />
                </div>
            </DockItem>

            {/* Glass Divider */}
            <div className="h-8 w-1.5 rounded-full bg-white/5 border-x border-white/5 mb-2 mx-1" />

            {/* Profile */}
            <DockItem mouseX={mouseX} onClick={() => router.push("/profile")} label="Profile" position={position}>
                <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded-xl border border-white/10 hover:bg-zinc-700 transition-colors">
                    <User className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                </div>
            </DockItem>
        </motion.div>
    );
}

function DockItem({
    mouseX,
    children,
    onClick,
    isActive,
    label,
    position = "bottom",
}: {
    mouseX: MotionValue;
    children: React.ReactNode;
    onClick?: () => void;
    isActive?: boolean;
    label?: string;
    position?: "bottom" | "top";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const distance = useTransform(mouseX, (val) => {
        const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    const widthSync = useTransform(distance, [-150, 0, 150], [40, 80, 40]);
    const width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <motion.div
            ref={ref}
            style={{ width }}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileTap={{ scale: 0.9 }}
            className="aspect-square relative cursor-pointer group flex flex-col items-center justify-end"
        >
            <AnimatePresence>
                {isHovered && label && (
                    <motion.div
                        initial={{ opacity: 0, y: position === "bottom" ? 10 : -10, scale: 0.8 }}
                        animate={{ opacity: 1, y: position === "bottom" ? -12 : 12, scale: 1 }}
                        exit={{ opacity: 0, y: position === "bottom" ? 5 : -5, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                            "absolute left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/90 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-200 whitespace-nowrap shadow-xl z-50 pointer-events-none",
                            position === "bottom" ? "-top-10" : "-bottom-10"
                        )}
                    >
                        {label}
                        {/* Glass Stem */}
                        <div className={cn(
                            "absolute left-1/2 -translate-x-1/2 w-[1px] h-2 bg-gradient-to-b from-white/20 to-transparent",
                            position === "bottom" ? "-bottom-2" : "-top-2 rotate-180"
                        )} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="w-full h-full relative z-10">
                {children}
            </div>

            {isActive && (
                <motion.div
                    layoutId="activeSpotlight"
                    className={cn(
                        "absolute left-1/2 -translate-x-1/2 w-12 h-12 bg-blue-500/20 blur-xl rounded-full pointer-events-none",
                        position === "bottom" ? "-bottom-4" : "-top-4"
                    )}
                />
            )}
        </motion.div>
    );
}
