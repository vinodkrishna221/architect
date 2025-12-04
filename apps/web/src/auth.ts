import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import { Waitlist } from "@/lib/models";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: MongoDBAdapter(clientPromise),
    session: { strategy: "jwt" },
    providers: [
        Credentials({
            name: "Access Code",
            credentials: {
                email: { label: "Email", type: "email" },
                accessCode: { label: "Access Code", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.accessCode) return null;
                const email = (credentials.email as string).toLowerCase();
                const accessCode = credentials.accessCode as string;

                try {
                    await dbConnect();
                    const waitlistEntry = await Waitlist.findOne({ email });

                    if (waitlistEntry && waitlistEntry.status === "APPROVED") {
                        // Verify Access Code
                        const isValid = await bcrypt.compare(accessCode, waitlistEntry.accessCode || "");
                        if (isValid) {
                            return {
                                id: waitlistEntry._id.toString(),
                                email: waitlistEntry.email,
                                name: waitlistEntry.name || email.split("@")[0]
                            };
                        }
                    }
                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            }
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user }) {
            if (process.env.NODE_ENV === "development") {
                console.log("[Auth] SignIn Callback Started", { email: user.email });
            }
            // 1. Check if user exists in Waitlist
            if (!user.email) {
                // console.log("[Auth] No email provided");
                return false;
            }
            const email = user.email.toLowerCase(); // Enforce case-insensitivity

            try {
                await dbConnect();
                const waitlistEntry = await Waitlist.findOne({ email });
                // console.log("[Auth] Waitlist Lookup", { email, found: !!waitlistEntry, status: waitlistEntry?.status });

                if (waitlistEntry && waitlistEntry.status === "APPROVED") {
                    // Rate Limiting Logic
                    const now = new Date();
                    const lastAttempt = waitlistEntry.lastLoginAttempt;
                    const COOLDOWN_MS = 60 * 1000; // 60 seconds

                    if (lastAttempt && (now.getTime() - lastAttempt.getTime() < COOLDOWN_MS)) {
                        console.warn(`[Auth] Rate limit exceeded for ${email}`);
                        return false; // Or redirect to error page
                    }

                    // Update last login attempt
                    waitlistEntry.lastLoginAttempt = now;
                    await waitlistEntry.save();
                    // console.log("[Auth] Login Approved");

                    return true;
                }

                // If not on waitlist, deny access
                // console.log("[Auth] Access Denied: Not on waitlist or not approved");
                return false;

            } catch (error) {
                console.error("[Auth] Waitlist check error:", error);
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
