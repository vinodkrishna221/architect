import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { authConfig } from "./auth.config";
import Nodemailer from "next-auth/providers/nodemailer";
import dbConnect from "@/lib/db";
import { Waitlist } from "@/lib/models";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },
    providers: [
        Nodemailer({
            server: {
                host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
                port: Number(process.env.EMAIL_SERVER_PORT) || 587,
                auth: {
                    user: "bandavinodkrishna@gmail.com",
                    pass: process.env.EMAIL_SERVER_PASSWORD || "wazmkabdszpifdvh"
                },
                tls: {
                    rejectUnauthorized: false
                }
            },
            from: process.env.EMAIL_FROM,
            maxAge: 15 * 60, // 15 minutes
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user }) {
            // 1. Check if user exists in Waitlist
            if (!user.email) return false;
            const email = user.email.toLowerCase(); // Enforce case-insensitivity

            try {
                await dbConnect();
                const waitlistEntry = await Waitlist.findOne({ email });

                if (waitlistEntry && waitlistEntry.status === "APPROVED") {
                    // Rate Limiting Logic
                    const now = new Date();
                    const lastAttempt = waitlistEntry.lastLoginAttempt;
                    const COOLDOWN_MS = 60 * 1000; // 60 seconds

                    if (lastAttempt && (now.getTime() - lastAttempt.getTime() < COOLDOWN_MS)) {
                        console.warn(`Rate limit exceeded for ${email}`);
                        return false; // Or redirect to error page
                    }

                    // Update last login attempt
                    waitlistEntry.lastLoginAttempt = now;
                    await waitlistEntry.save();

                    return true;
                }

                // If not on waitlist, deny access
                return false;

            } catch (error) {
                console.error("Waitlist check error:", error);
                return false;
            }
        },
        async session({ session, user }) {
            // Add user ID to session
            if (session.user) {
                session.user.id = user.id;
            }
            return session;
        }
    },
});
