import { cn } from "@/lib/utils";
import { Box, Code2, Cpu, Globe, Layout, Smartphone, Terminal, Zap } from "lucide-react";

interface ProjectIconProps {
    id: string;
    className?: string;
}

export function ProjectIcon({ id, className }: ProjectIconProps) {
    // Deterministic icon based on ID
    const icons = [Box, Layout, Smartphone, Globe, Cpu, Terminal, Code2, Zap];
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % icons.length;
    const Icon = icons[index];

    return (
        <div className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 shadow-inner",
            className
        )}>
            <Icon className="w-1/2 h-1/2 text-zinc-400" />
        </div>
    );
}
