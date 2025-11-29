"use client";

import { useDashboardStore } from "@/lib/store";
import { AnimatePresence, motion } from "framer-motion";
import { ArchiveView } from "./ArchiveView";
import { ProjectView } from "./ProjectView";

export function CanvasArea() {
    const { view } = useDashboardStore();

    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="wait">
                {view === 'ARCHIVE' ? (
                    <motion.div
                        key="archive"
                        initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <ArchiveView />
                    </motion.div>
                ) : (
                    <motion.div
                        key="project"
                        initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 200, damping: 20, mass: 1 }}
                        className="absolute inset-0 w-full h-full"
                    >
                        <ProjectView />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
