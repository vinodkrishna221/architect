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
 * 
 * NOTE: Credits are tracked on the Waitlist collection (not User),
 * since this app uses access-code based auth via Waitlist.
 */

import dbConnect from "@/lib/db";
import { Waitlist } from "@/lib/models";

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
 * @param userEmail - User's email address (from session)
 */
export async function hasEnoughCredits(
    userEmail: string,
    cost: number
): Promise<{ hasCredits: boolean; currentCredits: number }> {
    await dbConnect();

    const user = await Waitlist.findOne({ email: userEmail }).select("credits").lean();
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
 * @param userEmail - User's email address (from session)
 */
export async function deductCredits(
    userEmail: string,
    cost: number,
    action: string
): Promise<CreditResult> {
    await dbConnect();

    // Use atomic operation to prevent race conditions
    const result = await Waitlist.findOneAndUpdate(
        {
            email: userEmail,
            credits: { $gte: cost } // Only update if enough credits
        },
        {
            $inc: { credits: -cost }
        },
        {
            new: true,
            select: "credits email"
        }
    ).lean();

    if (!result) {
        // Check if user exists or just doesn't have enough credits
        const user = await Waitlist.findOne({ email: userEmail }).select("credits").lean();
        if (!user) {
            return {
                success: false,
                remainingCredits: 0,
                error: "User not found in waitlist",
            };
        }
        const currentCredits = (user as { credits?: number }).credits ?? 0;
        return {
            success: false,
            remainingCredits: currentCredits,
            error: `Insufficient credits. You have ${currentCredits.toFixed(1)} credits but this action costs ${cost} credits.`,
        };
    }

    const remaining = (result as { credits?: number }).credits ?? 0;
    console.log(`[Credits] ${userEmail} spent ${cost} credits on ${action}. Remaining: ${remaining}`);

    return {
        success: true,
        remainingCredits: remaining,
    };
}

/**
 * Get user's current credit balance
 * @param userEmail - User's email address (from session)
 */
export async function getCreditBalance(userEmail: string): Promise<number> {
    await dbConnect();

    const user = await Waitlist.findOne({ email: userEmail }).select("credits").lean();
    if (!user) {
        return 0;
    }

    return (user as { credits?: number }).credits ?? DEFAULT_CREDITS;
}

/**
 * Add credits to user's account (admin function)
 * @param userEmail - User's email address
 */
export async function addCredits(
    userEmail: string,
    amount: number
): Promise<CreditResult> {
    await dbConnect();

    const result = await Waitlist.findOneAndUpdate(
        { email: userEmail },
        {
            $inc: { credits: amount }
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

    const newBalance = (result as { credits?: number }).credits ?? 0;
    console.log(`[Credits] Added ${amount} credits to ${userEmail}. New balance: ${newBalance}`);

    return {
        success: true,
        remainingCredits: newBalance,
    };
}
