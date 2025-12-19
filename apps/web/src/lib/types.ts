/**
 * Centralized Type Definitions
 * All shared types should be imported from this file
 */

// ============ PROJECT TYPES ============

/**
 * Project status enum
 */
export type ProjectStatus = "DRAFT" | "GENERATING" | "COMPLETED" | "AWAITING_ANSWERS";

// ============ CONVERSATION TYPES ============

/**
 * Conversation status enum
 */
export type ConversationStatus = "in_progress" | "complete" | "abandoned";

/**
 * Message category for interrogation
 */
export type MessageCategory = "users" | "problem" | "technical" | "scope";

/**
 * Message interface for conversations
 * Note: 'role' here refers to the chat sender type ("user" = human, "assistant" = AI)
 * This is NOT related to Waitlist.jobRole (user's profession like "Developer")
 */
export interface Message {
    id: string;
    role: "user" | "assistant";  // Chat sender type: human or AI (not job role!)
    content: string;
    category?: MessageCategory;
    timestamp: Date;
}

// ============ BLUEPRINT TYPES ============

/**
 * Blueprint document types
 */
export type BlueprintType =
    | "design-system"
    | "frontend"
    | "backend"
    | "database"
    | "security"
    | "mvp-features";

/**
 * Blueprint generation status
 */
export type BlueprintStatus = "pending" | "generating" | "complete" | "error";

/**
 * Blueprint suite status
 */
export type BlueprintSuiteStatus = "generating" | "complete" | "partial" | "error";

/**
 * Blueprint interface for client-side use
 */
export interface Blueprint {
    id: string;
    type: BlueprintType | string;
    title: string;
    content: string;
    status: BlueprintStatus;
}

/**
 * Waitlist status enum
 */
export type WaitlistStatus = "PENDING" | "APPROVED" | "REDEEMED";

// ============ IMPLEMENTATION PROMPT TYPES (Phase 3) ============

/**
 * Implementation prompt category - strict order
 */
export type PromptCategory =
    | "setup"
    | "database"
    | "auth"
    | "api"
    | "shared-components"
    | "features"
    | "pages"
    | "testing";

/**
 * Implementation prompt status
 */
export type PromptStatus = "pending" | "unlocked" | "in_progress" | "completed" | "skipped";

/**
 * Prompt sequence status
 */
export type PromptSequenceStatus = "generating" | "complete" | "partial" | "error";

/**
 * Implementation prompt interface for client-side use
 */
export interface ImplementationPrompt {
    id: string;
    sequence: number;
    category: PromptCategory;
    title: string;
    content: string;
    prerequisites: string[];
    userActions: string[];
    acceptanceCriteria: string[];
    status: PromptStatus;
    completedAt?: Date;
    estimatedTime?: string;
}

/**
 * Prompt sequence interface for client-side use
 */
export interface PromptSequenceInfo {
    id: string;
    projectId: string;
    status: PromptSequenceStatus;
    totalPrompts: number;
    completedPrompts: number;
    currentPromptIndex: number;
}
