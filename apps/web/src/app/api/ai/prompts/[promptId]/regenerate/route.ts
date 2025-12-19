import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { ImplementationPrompt, Blueprint, Project } from "@/lib/models";
import { callGLM } from "@/lib/ai/client";
import {
    ENGINEERING_MANAGER_SYSTEM_PROMPT,
    buildImplementationPromptRequest,
    parsePromptResponse,
    CATEGORY_INFO,
} from "@/lib/ai/prompts/implementation-prompts";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";
import type { Blueprint as BlueprintType, PromptCategory } from "@/lib/types";

interface RouteParams {
    params: Promise<{ promptId: string }>;
}

/**
 * POST /api/ai/prompts/[promptId]/regenerate
 * Regenerate a single implementation prompt (costs 0.2 credits)
 */
export async function POST(req: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { promptId } = await params;

        if (!promptId) {
            return NextResponse.json(
                { error: "promptId is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Fetch prompt and validate ownership
        const prompt = await ImplementationPrompt.findById(promptId);

        if (!prompt) {
            return NextResponse.json(
                { error: "Prompt not found" },
                { status: 404 }
            );
        }

        // Validate ownership through project
        const project = await Project.findOne({
            _id: prompt.projectId,
            userId: session.user.id,
        });

        if (!project) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // Deduct credits for regeneration
        const creditResult = await deductCredits(
            session.user.email!,
            CREDIT_COSTS.PROMPT_REGENERATE,
            "prompt_regeneration"
        );

        if (!creditResult.success) {
            return NextResponse.json(
                {
                    error: "Insufficient credits",
                    message: creditResult.error,
                    remainingCredits: creditResult.remainingCredits,
                    requiredCredits: CREDIT_COSTS.PROMPT_REGENERATE,
                },
                { status: 402 }
            );
        }

        // Fetch blueprints for context
        const blueprints = await Blueprint.find({
            suiteId: prompt.suiteId,
            status: "complete"
        });

        const blueprintsForContext: BlueprintType[] = blueprints.map(b => ({
            id: b._id.toString(),
            type: b.type,
            title: b.title,
            content: b.content,
            status: b.status,
        }));

        // Get previously generated prompt titles for context
        const previousPrompts = await ImplementationPrompt.find({
            projectId: prompt.projectId,
            sequence: { $lt: prompt.sequence },
        }).select("title").sort({ sequence: 1 });

        const previousTitles = previousPrompts.map(p => p.title);

        // Extract tech stack
        const frontendPrd = blueprintsForContext.find(b => b.type === "frontend");
        const techStack = frontendPrd?.content?.match(/framework[:\s]*([\w\s.]+)/i)?.[1]
            || "Next.js 15, TypeScript, Tailwind CSS, MongoDB";

        // Build regeneration request
        const promptRequest = buildImplementationPromptRequest(
            prompt.category as PromptCategory,
            blueprintsForContext,
            project.title,
            techStack,
            previousTitles
        );

        // Add specific instruction to regenerate this exact prompt
        const regenerateRequest = `${promptRequest}

IMPORTANT: Regenerate specifically the prompt titled "${prompt.title}".
Keep the same title but improve the content based on the context.`;

        // Call AI
        const response = await callGLM(
            ENGINEERING_MANAGER_SYSTEM_PROMPT,
            regenerateRequest
        );

        // Parse response
        const parsedPrompts = parsePromptResponse(response);
        const regeneratedPrompt = parsedPrompts[0]; // Take first result

        if (!regeneratedPrompt) {
            return NextResponse.json(
                { error: "Failed to parse regenerated prompt" },
                { status: 500 }
            );
        }

        // Update prompt content
        prompt.content = regeneratedPrompt.content;
        prompt.userActions = regeneratedPrompt.userActions.length > 0
            ? regeneratedPrompt.userActions
            : prompt.userActions;
        prompt.acceptanceCriteria = regeneratedPrompt.acceptanceCriteria.length > 0
            ? regeneratedPrompt.acceptanceCriteria
            : prompt.acceptanceCriteria;

        // Reset status if it was completed
        if (prompt.status === "completed") {
            prompt.status = "unlocked";
            prompt.completedAt = undefined;
        }

        await prompt.save();

        return NextResponse.json({
            success: true,
            promptId: prompt._id.toString(),
            title: prompt.title,
            content: prompt.content,
            userActions: prompt.userActions,
            acceptanceCriteria: prompt.acceptanceCriteria,
            status: prompt.status,
            remainingCredits: creditResult.remainingCredits,
        });

    } catch (error) {
        console.error("[API] Regenerate prompt error:", error);
        return NextResponse.json(
            { error: "Failed to regenerate prompt" },
            { status: 500 }
        );
    }
}
