/**
 * Credit System Constants
 * 
 * This file contains ONLY constants that are safe for both client and server.
 * For server-side credit operations (db queries), import from credits.ts instead.
 */

// Credit costs
export const CREDIT_COSTS = {
    MESSAGE: 0.1,           // Per interview message
    BLUEPRINT_SUITE: 3,     // Full PRD generation
    AI_EDIT: 0.3,           // Per AI-assisted edit
    PROJECT: 0,             // Free
    PROMPT_SEQUENCE: 1.5,   // Full prompt sequence generation
    PROMPT_REGENERATE: 0.2, // Single prompt regeneration
} as const;

// Default credits for new/beta users
export const DEFAULT_CREDITS = 30;
