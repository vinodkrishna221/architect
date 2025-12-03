import mongoose, { Schema } from "mongoose";

// 1. WAITLIST SCHEMA
const WaitlistSchema = new Schema({
    email: { type: String, required: true, unique: true },
    status: {
        type: String,
        enum: ["PENDING", "APPROVED", "REDEEMED"],
        default: "APPROVED"
    },
    createdAt: { type: Date, default: Date.now },
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

// Singleton Model Export Helper
export const Waitlist = mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema);
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
