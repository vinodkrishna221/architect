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
    // Credit system - 30 credits for beta users, no auto-refill
    credits: { type: Number, default: 30 },
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
    // Credit system - 30 credits for beta users, no auto-refill
    credits: { type: Number, default: 30 },
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
    // User-selected project type for dynamic PRD generation
    projectType: {
        type: String,
        enum: ["saas", "marketplace", "mobile", "ecommerce", "internal", "api", "ai-product", "cli", "iot", "educational"],
        default: "saas"
    },
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
    // Project classification (detected by AI during interrogation)
    projectType: {
        type: String,
        enum: ["saas", "marketplace", "mobile", "ecommerce", "internal", "api", "ai-product", "cli", "iot", "educational", null],
        default: null
    },
    detectedFeatures: [{
        type: String,
        enum: ["payments", "real-time", "file-uploads", "notifications", "analytics", "multi-tenant", "third-party-integrations", "offline-support", "i18n", "gamification", "video-content", "interactive-exercises"]
    }],
    // AI confidence per category (0.0 - 1.0)
    confidenceScores: {
        users: { type: Number, default: 0 },
        problem: { type: Number, default: 0 },
        technical: { type: Number, default: 0 },
        scope: { type: Number, default: 0 }
    }
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
        required: true
        // Dynamic: No longer enum-restricted, allows new PRD types
    },
    title: { type: String, required: true },
    content: { type: String, default: "" }, // Markdown content
    status: {
        type: String,
        enum: ["pending", "generating", "complete", "error"],
        default: "pending",
    },
}, { timestamps: true });

// Blueprint Suite (collection of blueprints - variable count based on project type)
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
    totalCount: { type: Number, default: 6 }, // Dynamic based on project type
    selectedTypes: [{ type: String }], // Which blueprint types were generated
}, { timestamps: true });

export const Conversation = mongoose.models.Conversation ||
    mongoose.model("Conversation", ConversationSchema);

export const Blueprint = mongoose.models.Blueprint ||
    mongoose.model("Blueprint", BlueprintSchema);

export const BlueprintSuite = mongoose.models.BlueprintSuite ||
    mongoose.model("BlueprintSuite", BlueprintSuiteSchema);

// ============ FEEDBACK MODEL ============

const FeedbackSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["feedback", "feature", "bug"],
        required: true,
    },
    email: { type: String, required: true },
    subject: { type: String, required: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 2000 },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "critical"],
        default: "medium",
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
    },
    status: {
        type: String,
        enum: ["pending", "reviewed", "resolved"],
        default: "pending",
    },
    browserInfo: { type: String }, // Auto-detected for bug reports
}, { timestamps: true });


// Index for admin queries
FeedbackSchema.index({ status: 1, createdAt: -1 });

export const Feedback = mongoose.models.Feedback ||
    mongoose.model("Feedback", FeedbackSchema);

// ============ IMPLEMENTATION PROMPTS (Phase 3) ============

// Individual implementation prompt for coding assistants
const ImplementationPromptSchema = new mongoose.Schema({
    suiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlueprintSuite",
        required: true,
        index: true,
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    sequence: { type: Number, required: true }, // Order in the sequence
    category: {
        type: String,
        enum: ["setup", "database", "auth", "api", "shared-components", "features", "pages", "testing"],
        required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true }, // The actual prompt markdown
    prerequisites: [{ type: String }], // Names of prompts that must complete first
    userActions: [{ type: String }], // Required user actions before using
    acceptanceCriteria: [{ type: String }],
    status: {
        type: String,
        enum: ["pending", "unlocked", "in_progress", "completed", "skipped"],
        default: "pending",
    },
    completedAt: Date,
    estimatedTime: String, // e.g., "15-30 mins"
}, { timestamps: true });

// Compound index for common queries
ImplementationPromptSchema.index({ projectId: 1, sequence: 1 });

// Collection of prompts for a project
const PromptSequenceSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        unique: true, // One sequence per project
        index: true,
    },
    suiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlueprintSuite",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    status: {
        type: String,
        enum: ["generating", "complete", "partial", "error"],
        default: "generating",
    },
    totalPrompts: { type: Number, default: 0 },
    completedPrompts: { type: Number, default: 0 },
    currentPromptIndex: { type: Number, default: 0 },
}, { timestamps: true });

export const ImplementationPrompt = mongoose.models.ImplementationPrompt ||
    mongoose.model("ImplementationPrompt", ImplementationPromptSchema);

export const PromptSequence = mongoose.models.PromptSequence ||
    mongoose.model("PromptSequence", PromptSequenceSchema);
