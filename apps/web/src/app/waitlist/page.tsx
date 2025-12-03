"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GridBackground } from "@/components/shared/GridBackground";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function WaitlistPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setErrorMessage("");

        try {
            const response = await fetch("/api/waitlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setStatus("success");
            setEmail("");
        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message || "Failed to join waitlist");
        }
    };

    return (
        <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black text-white">
            <GridBackground />

            <div className="absolute top-6 left-6 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                </Link>
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                            Join the Waitlist
                        </h1>
                        <p className="text-zinc-400">
                            Be the first to access the Architect. <br />
                            Stop hallucinating, start building.
                        </p>
                    </div>

                    {status === "success" ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                                <Check className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-semibold text-green-400 mb-1">You're on the list!</h3>
                            <p className="text-zinc-400 text-sm">
                                We'll notify you as soon as we're ready for you.
                            </p>
                            <Button
                                variant="ghost"
                                className="mt-6 text-zinc-400 hover:text-white"
                                onClick={() => setStatus("idle")}
                            >
                                Add another email
                            </Button>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            {status === "error" && (
                                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                variant="default"
                                className="w-full h-12 text-lg"
                                disabled={status === "loading"}
                            >
                                {status === "loading" ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    <>
                                        Join Waitlist
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </motion.div>
            </div>
        </main>
    );
}
