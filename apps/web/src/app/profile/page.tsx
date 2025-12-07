"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { KineticBackground } from "@/components/ui/KineticBackground";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Dock } from "@/components/dashboard/layout/Dock";
import { LogOut, Mail, Calendar, FolderOpen, FileCheck, Loader2, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserStats {
    projectCount: number;
    blueprintCount: number;
    todayUsage: number;
    dailyLimit: number;
    remainingToday: number;
}

interface RecentProject {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user stats
                const statsRes = await fetch("/api/user/stats");
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setStats(data);
                }

                // Fetch recent projects
                const projectsRes = await fetch("/api/projects");
                if (projectsRes.ok) {
                    const data = await projectsRes.json();
                    setRecentProjects((data.projects || []).slice(0, 3));
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setIsLoading(false);
            }
        }

        if (status === "authenticated") {
            fetchData();
        }
    }, [status]);

    const handleSignOut = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    if (status === "loading") {
        return (
            <AuroraBackground>
                <KineticBackground>
                    <div className="flex items-center justify-center h-screen">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                </KineticBackground>
            </AuroraBackground>
        );
    }

    if (status === "unauthenticated") {
        return null; // Will redirect
    }

    return (
        <AuroraBackground>
            <KineticBackground>
                <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 py-20">
                    <Dock />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-30 w-full max-w-lg space-y-6"
                    >
                        {/* Profile Card */}
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
                            <div className="flex flex-col items-center gap-6">
                                {/* Avatar */}
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                                </div>

                                {/* User Info */}
                                <div className="text-center">
                                    <h1 className="text-2xl font-bold text-white mb-2">
                                        {session?.user?.name || "User"}
                                    </h1>
                                    <div className="flex items-center justify-center gap-2 text-white/70">
                                        <Mail className="w-4 h-4" />
                                        <span>{session?.user?.email || "No email"}</span>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-3 gap-4 w-full mt-4">
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <FolderOpen className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : stats?.projectCount ?? 0}
                                        </p>
                                        <p className="text-white/50 text-xs">Projects</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <FileCheck className="w-4 h-4 text-green-400" />
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : stats?.blueprintCount ?? 0}
                                        </p>
                                        <p className="text-white/50 text-xs">Blueprints</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-4 text-center">
                                        <div className="flex items-center justify-center gap-1 mb-1">
                                            <Calendar className="w-4 h-4 text-amber-400" />
                                        </div>
                                        <p className="text-2xl font-bold text-white">
                                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `${stats?.remainingToday ?? 3}/${stats?.dailyLimit ?? 3}`}
                                        </p>
                                        <p className="text-white/50 text-xs">Today</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Projects */}
                        {!isLoading && recentProjects.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl"
                            >
                                <h2 className="text-sm font-bold text-white/70 mb-4 tracking-wider">RECENT PROJECTS</h2>
                                <div className="space-y-2">
                                    {recentProjects.map((project) => (
                                        <Link
                                            key={project.id}
                                            href={`/project/${project.id}`}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                                        >
                                            <div>
                                                <p className="text-white font-medium group-hover:text-blue-300 transition-colors">
                                                    {project.title}
                                                </p>
                                                <p className="text-white/50 text-xs">
                                                    {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Sign Out */}
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </motion.button>
                    </motion.div>
                </div>
            </KineticBackground>
        </AuroraBackground>
    );
}
