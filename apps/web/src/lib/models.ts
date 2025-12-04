import mongoose, { Schema } from "mongoose";

// 1. WAITLIST SCHEMA
const WaitlistSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String }, // Optional: User's name
    role: { type: String }, // Optional: Developer, Designer, Founder, etc.
    referralSource: { type: String }, // Optional: How did you hear about us?
    reason: { type: String }, // Optional: Why do you want to join?
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REDEEMED"],
        default: "PENDING"
    },
    createdAt: { type: Date, default: Date.now },
    lastLoginAttempt: { type: Date },
    accessCode: { type: String }, // Hashed access code for login
});

// 2. USER SCHEMA
// Extends standard NextAuth fields if needed, but for now we keep it simple
// NextAuth Adapter will handle creating users in the 'users' collection automatically.
// We define this here if we need to query users via Mongoose later.
const UserSchema = new Schema({
    name: String,
    email: { type: String, unique: true },
    emailVerified: Date,
    image: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// 3. CHANGELOG SCHEMA
const ChangelogSchema = new Schema({
    version: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true }, // Markdown or HTML
    date: { type: Date, default: Date.now },
});

// Singleton Model Export Helper
export const Waitlist = mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema);
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Changelog = mongoose.models.Changelog || mongoose.model("Changelog", ChangelogSchema);
