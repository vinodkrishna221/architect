import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Conversation, Blueprint, BlueprintSuite, Project } from "@/lib/models";
import { callGLM } from "@/lib/ai/client";
import {
    BLUEPRINT_SYSTEM_PROMPT,
    BLUEPRINT_CONFIGS,
    buildBlueprintPrompt,
    BlueprintType,
} from "@/lib/ai/prompts/blueprints";
import { selectBlueprints, getBlueprintTitle } from "@/lib/ai/prompts/blueprint-selector";
import { deductCredits, addCredits, CREDIT_COSTS } from "@/lib/credits";
import { ProjectType, FeatureFlag } from "@/lib/ai/prompts/interrogation";

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

        // 3. Check for existing suite (duplicate prevention)
        const existingSuite = await BlueprintSuite.findOne({
            projectId: conversation.projectId,
            status: { $in: ["generating", "complete", "partial"] }
        });

        if (existingSuite) {
            // Return existing suite instead of charging again
            const existingBlueprints = await Blueprint.find({ suiteId: existingSuite._id });
            return NextResponse.json({
                suiteId: existingSuite._id,
                status: existingSuite.status,
                completedCount: existingSuite.completedCount,
                totalCount: existingSuite.totalCount || 6,
                selectedTypes: existingSuite.selectedTypes || [],
                isExisting: true, // Flag to indicate this is a retry/existing
            });
        }

        // 3. Deduct credits for blueprint suite generation (3 credits)
        const creditResult = await deductCredits(
            session.user.email!,
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

        // 5. Fetch the project to get user-selected projectType
        const project = await Project.findById(conversation.projectId).select('projectType').lean();
        const userProjectType = (project as { projectType?: string })?.projectType || 'saas';

        // 6. Select blueprints based on user-selected project type and AI-detected features
        const blueprintTypes = selectBlueprints(
            userProjectType as ProjectType,
            conversation.detectedFeatures as FeatureFlag[] | null
        );

        // 6. Create BlueprintSuite record
        const suite = await BlueprintSuite.create({
            projectId: conversation.projectId,
            conversationId: conversation._id,
            status: "generating",
            completedCount: 0,
            totalCount: blueprintTypes.length,
            selectedTypes: blueprintTypes,
        });

        // 7. Create Blueprint records (pending) for each selected type
        const blueprintRecords = await Promise.all(
            blueprintTypes.map((type) =>
                Blueprint.create({
                    suiteId: suite._id,
                    type,
                    title: getBlueprintTitle(type),
                    content: "",
                    status: "pending",
                })
            )
        );

        // 8. Generate each blueprint SEQUENTIALLY
        let completedCount = 0;
        let hasErrors = false;

        for (const blueprint of blueprintRecords) {
            try {
                // Update status to generating
                blueprint.status = "generating";
                await blueprint.save();

                // Build prompt and call AI - use config if available, else generic
                const config = BLUEPRINT_CONFIGS[blueprint.type as BlueprintType];
                const prompt = config
                    ? buildBlueprintPrompt(blueprint.type as BlueprintType, conversationSummary)
                    : `Generate a ${getBlueprintTitle(blueprint.type)} based on these requirements:\n\n${conversationSummary}`;

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

        // 10. Set final status and handle refund if all failed
        if (completedCount === blueprintTypes.length) {
            suite.status = "complete";
        } else if (completedCount > 0) {
            suite.status = "partial";
        } else {
            suite.status = "error";
            // REFUND: All blueprints failed - return credits to user
            await addCredits(
                session.user.email!,
                CREDIT_COSTS.BLUEPRINT_SUITE
            );
            console.log(`[Credits] Refunded ${CREDIT_COSTS.BLUEPRINT_SUITE} credits to ${session.user.email} - all blueprints failed`);
        }
        await suite.save();

        return NextResponse.json({
            suiteId: suite._id,
            status: suite.status,
            completedCount: suite.completedCount,
            totalCount: suite.totalCount,
            selectedTypes: suite.selectedTypes,
        });
    } catch (error) {
        console.error("[API] Generate suite error:", error);
        return NextResponse.json(
            { error: "Failed to generate blueprints" },
            { status: 500 }
        );
    }
}
