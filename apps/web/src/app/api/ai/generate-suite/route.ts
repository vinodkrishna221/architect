import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Conversation, Blueprint, BlueprintSuite } from "@/lib/models";
import { callGLM } from "@/lib/ai/client";
import {
    BLUEPRINT_TYPES,
    BLUEPRINT_SYSTEM_PROMPT,
    BLUEPRINT_CONFIGS,
    buildBlueprintPrompt,
    BlueprintType,
} from "@/lib/ai/prompts/blueprints";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";

// Extended timeout for long-running generation (5 minutes)
export const maxDuration = 300;

interface GenerateSuiteRequest {
    conversationId: string;
}

/**
 * Builds a summary of the conversation for blueprint generation
 */
function buildConversationSummary(
    initialDescription: string,
    messages: { role: string; content: string; category?: string }[]
): string {
    const qaPairs = [];

    for (let i = 0; i < messages.length; i += 2) {
        const question = messages[i];
        const answer = messages[i + 1];

        if (question?.role === "assistant" && answer?.role === "user") {
            qaPairs.push(`Q: ${question.content}\nA: ${answer.content}`);
        }
    }

    return `## Initial Description
${initialDescription}

## Interview Q&A
${qaPairs.join("\n\n")}`;
}

export async function POST(req: Request) {
    try {
        // 1. Authentication check FIRST
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId }: GenerateSuiteRequest = await req.json();

        if (!conversationId) {
            return NextResponse.json(
                { error: "conversationId is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // 2. Fetch conversation with ownership validation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: session.user.id, // CRITICAL: Ownership validation
        });

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Check if conversation is ready for blueprints
        if (!conversation.isReadyForBlueprints) {
            return NextResponse.json(
                { error: "Conversation is not ready for blueprint generation" },
                { status: 400 }
            );
        }

        // 3. Deduct credits for blueprint suite generation (3 credits)
        const creditResult = await deductCredits(
            session.user.id,
            CREDIT_COSTS.BLUEPRINT_SUITE,
            "blueprint_suite_generation"
        );

        if (!creditResult.success) {
            return NextResponse.json(
                {
                    error: "Insufficient credits",
                    message: creditResult.error,
                    remainingCredits: creditResult.remainingCredits,
                },
                { status: 402 } // Payment Required
            );
        }

        // 4. Build conversation summary
        const conversationSummary = buildConversationSummary(
            conversation.initialDescription,
            conversation.messages
        );

        // 5. Create BlueprintSuite record
        const suite = await BlueprintSuite.create({
            projectId: conversation.projectId,
            conversationId: conversation._id,
            status: "generating",
            completedCount: 0,
        });

        // 5. Create 6 Blueprint records (pending)
        const blueprintRecords = await Promise.all(
            BLUEPRINT_TYPES.map((type) =>
                Blueprint.create({
                    suiteId: suite._id,
                    type,
                    title: BLUEPRINT_CONFIGS[type].title,
                    content: "",
                    status: "pending",
                })
            )
        );

        // 6. Generate each blueprint SEQUENTIALLY
        let completedCount = 0;
        let hasErrors = false;

        for (const blueprint of blueprintRecords) {
            try {
                // Update status to generating
                blueprint.status = "generating";
                await blueprint.save();

                // Build prompt and call AI
                const prompt = buildBlueprintPrompt(
                    blueprint.type as BlueprintType,
                    conversationSummary
                );

                const markdownContent = await callGLM(BLUEPRINT_SYSTEM_PROMPT, prompt);

                // Save markdown content directly (no JSON parsing)
                blueprint.content = markdownContent;
                blueprint.status = "complete";
                await blueprint.save();

                completedCount++;

                // Update suite progress
                suite.completedCount = completedCount;
                await suite.save();
            } catch (blueprintError) {
                console.error(`Error generating ${blueprint.type}:`, blueprintError);
                blueprint.status = "error";
                await blueprint.save();
                hasErrors = true;
                // Continue with next blueprint - don't crash entire generation
            }
        }

        // 7. Set final status
        if (completedCount === 6) {
            suite.status = "complete";
        } else if (completedCount > 0) {
            suite.status = "partial";
        } else {
            suite.status = "error";
        }
        await suite.save();

        return NextResponse.json({
            suiteId: suite._id,
            status: suite.status,
            completedCount: suite.completedCount,
        });
    } catch (error) {
        console.error("[API] Generate suite error:", error);
        return NextResponse.json(
            { error: "Failed to generate blueprints" },
            { status: 500 }
        );
    }
}
