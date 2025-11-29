import { cn } from "@/lib/utils";
import { ProjectStatus } from "@/lib/mock-data";

interface StatusBadgeProps {
    status: ProjectStatus;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const styles = {
        DRAFT: "bg-zinc-900 text-zinc-500 border-zinc-800",
        GENERATING: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)] animate-pulse",
        COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        AWAITING_ANSWERS: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.2)] animate-pulse",
    };

    const labels = {
        DRAFT: "DRAFT",
        GENERATING: "GENERATING",
        COMPLETED: "READY",
        AWAITING_ANSWERS: "INPUT NEEDED",
    };

    return (
        <div className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-mono border tracking-wider",
            styles[status],
            className
        )}>
            {labels[status]}
        </div>
    );
}
