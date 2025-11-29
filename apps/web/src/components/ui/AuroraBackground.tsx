"use client";
import { motion } from "framer-motion";
import React from "react";

import { cn } from "@/lib/utils";

export const AuroraBackground = ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    return (
        <div className={cn("relative flex flex-col h-[100vh] items-center justify-center bg-black text-slate-950 transition-bg overflow-hidden", className)}>
            <div className="absolute inset-0 overflow-hidden">
                <div
                    className="absolute -inset-[10px] opacity-50 will-change-transform blur-[60px] bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,#000_100%)]"
                ></div>
                <div className="absolute inset-0 opacity-50">
                    {/* Obsidian Mist - Monochrome/Zinc Palette */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora bg-[repeating-linear-gradient(135deg,#000000_0%,#18181b_10%,#27272a_20%,#000000_30%)] [background-size:200%_200%] blur-[80px]" />
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-aurora-reverse bg-[repeating-linear-gradient(135deg,#09090b_0%,#18181b_10%,#3f3f46_20%,#09090b_30%)] [background-size:200%_200%] blur-[80px]" />
                </div>

                {/* Stars / Dust */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>
            {children}
        </div>
    );
};
