/**
 * Credit System Utilities
 * 
 * Credit costs:
 * - Interview messages: 0.1 credits per message
 * - Blueprint Suite generation: 3 credits
 * - AI-assisted edits: 0.3 credits (future)
 * - Project creation: FREE
 * 
 * Beta users start with 30 credits. Credits do NOT auto-refill.
 */

import dbConnect from "@/lib/db";
import { User } from "@/lib/models";

// Credit costs
export const CREDIT_COSTS = {
    MESSAGE: 0.1,        // Per interview message
    BLUEPRINT_SUITE: 3,  // Full PRD generation
    AI_EDIT: 0.3,        // Per AI-assisted edit
    PROJECT: 0,          // Free
} as const;

// Default credits for new/beta users
export const DEFAULT_CREDITS = 30;

interface CreditResult {
    success: boolean;
    remainingCredits: number;
    error?: string;
}

/**
 * Check if user has enough credits for an action
 */
export async function hasEnoughCredits(
    userId: string,
    cost: number
): Promise<{ hasCredits: boolean; currentCredits: number }> {
    await dbConnect();

    const user = await User.findById(userId).select("credits").lean();
    if (!user) {
        return { hasCredits: false, currentCredits: 0 };
    }

    const currentCredits = (user as { credits?: number }).credits ?? DEFAULT_CREDITS;
    return {
        hasCredits: currentCredits >= cost,
        currentCredits,
    };
}

/**
 * Deduct credits from user's account
 * Returns success status and remaining credits
 */
export async function deductCredits(
    userId: string,
    cost: number,
    action: string
): Promise<CreditResult> {
    await dbConnect();

    // Use atomic operation to prevent race conditions
    const result = await User.findOneAndUpdate(
        {
            _id: userId,
            credits: { $gte: cost } // Only update if enough credits
        },
        {
            $inc: { credits: -cost },
            $set: { updatedAt: new Date() }
        },
        {
            new: true,
            select: "credits"
        }
    ).lean();

    if (!result) {
        // Check if user exists or just doesn't have enough credits
        const user = await User.findById(userId).select("credits").lean();
        if (!user) {
            return {
                success: false,
                remainingCredits: 0,
                error: "User not found",
            };
        }
        const currentCredits = (user as { credits?: number }).credits ?? 0;
        return {
            success: false,
            remainingCredits: currentCredits,
            error: `Insufficient credits. You have ${currentCredits.toFixed(1)} credits but this action costs ${cost} credits.`,
        };
    }

    console.log(`[Credits] User ${userId} spent ${cost} credits on ${action}. Remaining: ${(result as { credits?: number }).credits}`);

    return {
        success: true,
        remainingCredits: (result as { credits?: number }).credits ?? 0,
    };
}

/**
 * Get user's current credit balance
 */
export async function getCreditBalance(userId: string): Promise<number> {
    await dbConnect();

    const user = await User.findById(userId).select("credits").lean();
    if (!user) {
        return 0;
    }

    return (user as { credits?: number }).credits ?? DEFAULT_CREDITS;
}

/**
 * Add credits to user's account (admin function)
 */
export async function addCredits(
    userId: string,
    amount: number
): Promise<CreditResult> {
    await dbConnect();

    const result = await User.findByIdAndUpdate(
        userId,
        {
            $inc: { credits: amount },
            $set: { updatedAt: new Date() }
        },
        {
            new: true,
            select: "credits"
        }
    ).lean();

    if (!result) {
        return {
            success: false,
            remainingCredits: 0,
            error: "User not found",
        };
    }

    console.log(`[Credits] Added ${amount} credits to user ${userId}. New balance: ${(result as { credits?: number }).credits}`);

    return {
        success: true,
        remainingCredits: (result as { credits?: number }).credits ?? 0,
    };
}
