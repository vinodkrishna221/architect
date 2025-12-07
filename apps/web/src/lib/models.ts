import mongoose, { Schema } from "mongoose";
import { ProjectStatus } from "./types";

// Re-export types for backward compatibility
export type { ProjectStatus } from "./types";

// 1. WAITLIST SCHEMA
const WaitlistSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String }, // Optional: User's name
    jobRole: { type: String }, // Optional: Developer, Designer, Founder, etc. (renamed from 'role' to avoid confusion with Message.role)
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

// 4. PROJECT SCHEMA

const ProjectSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
        type: String,
        enum: ["DRAFT", "GENERATING", "COMPLETED", "AWAITING_ANSWERS"] as ProjectStatus[],
        default: "DRAFT"
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
ProjectSchema.index({ userId: 1, createdAt: -1 });

// Singleton Model Export Helper
export const Waitlist = mongoose.models.Waitlist || mongoose.model("Waitlist", WaitlistSchema);
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Changelog = mongoose.models.Changelog || mongoose.model("Changelog", ChangelogSchema);
export const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);

// ============ AI FEATURE MODELS ============

// Message in a conversation
const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: { type: String, required: true },
    category: String, // 'users' | 'problem' | 'technical' | 'scope'
}, { timestamps: true });

// Conversation (interrogation session)
const ConversationSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Security: Fast lookups by user
    },
    initialDescription: { type: String, required: true },
    messages: [MessageSchema],
    status: {
        type: String,
        enum: ["in_progress", "complete", "abandoned"],
        default: "in_progress",
    },
    questionsAsked: { type: Number, default: 0 },
    isReadyForBlueprints: { type: Boolean, default: false },
}, { timestamps: true });

// Compound index for common queries
ConversationSchema.index({ userId: 1, projectId: 1 });

// Individual Blueprint
const BlueprintSchema = new mongoose.Schema({
    suiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlueprintSuite",
        required: true,
        index: true,
    },
    type: {
        type: String,
        enum: ["design-system", "frontend", "backend", "database", "security", "mvp-features"],
        required: true
    },
    title: { type: String, required: true },
    content: { type: String, default: "" }, // Markdown content
    status: {
        type: String,
        enum: ["pending", "generating", "complete", "error"],
        default: "pending",
    },
}, { timestamps: true });

// Blueprint Suite (collection of 6 blueprints)
const BlueprintSuiteSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: true, // One suite per project
        index: true,
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    status: {
        type: String,
        enum: ["generating", "complete", "partial", "error"],
        default: "generating",
    },
    completedCount: { type: Number, default: 0 },
}, { timestamps: true });

export const Conversation = mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);

export const Blueprint = mongoose.models.Blueprint ||
    mongoose.model("Blueprint", BlueprintSchema);

export const BlueprintSuite = mongoose.models.BlueprintSuite ||
    mongoose.model("BlueprintSuite", BlueprintSuiteSchema);
