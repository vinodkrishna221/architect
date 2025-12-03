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
        }),
    ],
    callbacks: {
        ...authConfig.callbacks,
        async signIn({ user, email }) {
            // 1. Check if user exists in Waitlist
            if (!user.email) return false;

            try {
                await dbConnect();
                const waitlistEntry = await Waitlist.findOne({ email: user.email });

                if (waitlistEntry && waitlistEntry.status === "APPROVED") {
                    return true;
                }

                // If not on waitlist, deny access
                // We can return a string to redirect to a specific error page, e.g. "/login?error=AccessDenied"
                // Or just false to show a generic error.
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
