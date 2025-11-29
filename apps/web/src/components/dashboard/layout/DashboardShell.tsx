"use client";
import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { AuroraBackground } from "../../ui/AuroraBackground";

interface DashboardShellProps {
    children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <AuroraBackground className="min-h-screen text-white selection:bg-indigo-500/30 block">
            <TopBar />
            {children}
        </AuroraBackground>
    );
}

export function DashboardCanvas({ children }: { children: ReactNode }) {
    return (
        <main className="fixed inset-4 top-20 bottom-4 z-10 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/5">
            {/* Top Highlight */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {children}
        </main>
    );
}
