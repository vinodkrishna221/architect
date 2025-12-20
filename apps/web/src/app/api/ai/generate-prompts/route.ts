import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import {
    BlueprintSuite,
    Blueprint,
    Project,
    ImplementationPrompt,
    PromptSequence,
} from "@/lib/models";
import { callGLM } from "@/lib/ai/client";
import {
    PROMPT_CATEGORIES,
    CATEGORY_INFO,
    ENGINEERING_MANAGER_SYSTEM_PROMPT,
    buildImplementationPromptRequest,
    parsePromptResponse,
    getDefaultUserActions,
} from "@/lib/ai/prompts/implementation-prompts";
import { deductCredits, addCredits, CREDIT_COSTS } from "@/lib/credits";
import type { PromptCategory, Blueprint as BlueprintType } from "@/lib/types";

// Extended timeout for long-running generation (5 minutes)
export const maxDuration = 300;

interface GeneratePromptsRequest {
    suiteId: string;
    skipCategories?: PromptCategory[]; // Optional: categories to skip
}

/**
 * POST /api/ai/generate-prompts
 * Generate implementation prompts for a completed blueprint suite
 */
export async function POST(req: Request) {
    try {
        // 1. Authentication check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { suiteId, skipCategories = [] }: GeneratePromptsRequest = await req.json();

        if (!suiteId) {
            return NextResponse.json(
                { error: "suiteId is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // 2. Fetch blueprint suite with ownership validation
        const suite = await BlueprintSuite.findOne({
            _id: suiteId,
        }).populate("projectId");

        if (!suite) {
            return NextResponse.json(
                { error: "Blueprint suite not found" },
                { status: 404 }
            );
        }

        // Get project and validate ownership
        const project = await Project.findOne({
            _id: suite.projectId,
            userId: session.user.id,
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or unauthorized" },
                { status: 403 }
            );
        }

        // Check if suite is complete
        if (suite.status !== "complete") {
            return NextResponse.json(
                { error: "Blueprint suite must be complete before generating prompts" },
                { status: 400 }
            );
        }

        // 3. Check for existing prompt sequence
        const existingSequence = await PromptSequence.findOne({
            projectId: project._id,
        });

        if (existingSequence) {
            // Check if sequence is stuck in generating or has pending prompts
            const isStuckGenerating = existingSequence.status === "generating";
            const pendingPrompts = await ImplementationPrompt.find({
                projectId: project._id,
                status: "pending",
            }).sort({ sequence: 1 });

            // Resume if: stuck in generating OR has pending prompts and not complete
            if (isStuckGenerating || (pendingPrompts.length > 0 && existingSequence.status !== "complete")) {
                // RESUME MODE: Continue without charging
                console.log(`[Resume] Resuming prompt generation for project ${project._id} (stuck: ${isStuckGenerating}, pending: ${pendingPrompts.length})`);

                // Get blueprints for context
                const blueprints = await Blueprint.find({ suiteId: suite._id, status: "complete" });
                const blueprintsForContext: BlueprintType[] = blueprints.map(b => ({
                    id: b._id.toString(),
                    type: b.type,
                    title: b.title,
                    content: b.content,
                    status: b.status,
                }));
                const techStack = extractTechStack(blueprintsForContext);

                return await resumeGeneration(
                    existingSequence,
                    project,
                    suite,
                    session.user.id,
                    blueprintsForContext,
                    techStack
                );
            }

            // Sequence exists and is complete - return existing
            return NextResponse.json({
                sequenceId: existingSequence._id,
                status: existingSequence.status,
                totalPrompts: existingSequence.totalPrompts,
                completedPrompts: existingSequence.completedPrompts,
                isExisting: true,
            });
        }

        // 4. Deduct credits for new sequence generation
        const creditResult = await deductCredits(
            session.user.email!,
            CREDIT_COSTS.PROMPT_SEQUENCE,
            "prompt_sequence_generation"
        );

        if (!creditResult.success) {
            return NextResponse.json(
                {
                    error: "Insufficient credits",
                    message: creditResult.error,
                    remainingCredits: creditResult.remainingCredits,
                    requiredCredits: CREDIT_COSTS.PROMPT_SEQUENCE,
                },
                { status: 402 }
            );
        }

        // 5. Fetch all blueprints for context
        const blueprints = await Blueprint.find({ suiteId: suite._id, status: "complete" });
        const blueprintsForContext: BlueprintType[] = blueprints.map(b => ({
            id: b._id.toString(),
            type: b.type,
            title: b.title,
            content: b.content,
            status: b.status,
        }));

        // Extract tech stack from blueprints (look in frontend/backend PRDs)
        const techStack = extractTechStack(blueprintsForContext);

        // 6. Create PromptSequence record
        const categoriesToGenerate = PROMPT_CATEGORIES.filter(
            c => !skipCategories.includes(c)
        );

        const sequence = await PromptSequence.create({
            projectId: project._id,
            suiteId: suite._id,
            userId: session.user.id,
            status: "generating",
            totalPrompts: 0, // Will be updated as we generate
            completedPrompts: 0,
            currentPromptIndex: 0,
        });

        // 7. Generate prompts for each category SEQUENTIALLY
        let promptSequenceNumber = 0;
        let hasErrors = false;
        const generatedPromptTitles: string[] = [];

        for (const category of categoriesToGenerate) {
            try {
                const categoryInfo = CATEGORY_INFO[category];

                // Build prompt request with context from blueprints
                const promptRequest = buildImplementationPromptRequest(
                    category,
                    blueprintsForContext,
                    project.title,
                    techStack,
                    generatedPromptTitles
                );

                // Call AI to generate prompts for this category
                const response = await callGLM(
                    ENGINEERING_MANAGER_SYSTEM_PROMPT,
                    promptRequest
                );

                // Parse the response into individual prompts
                const parsedPrompts = parsePromptResponse(response);

                // Save each prompt to database
                for (const parsed of parsedPrompts) {
                    promptSequenceNumber++;

                    // Determine prerequisites based on sequence
                    const prerequisites = generatedPromptTitles.slice(-3); // Last 3 prompts as prereqs

                    await ImplementationPrompt.create({
                        suiteId: suite._id,
                        projectId: project._id,
                        userId: session.user.id,
                        sequence: promptSequenceNumber,
                        category,
                        title: parsed.title,
                        content: parsed.content,
                        prerequisites: [...prerequisites, ...parsed.prerequisites],
                        userActions: parsed.userActions.length > 0
                            ? parsed.userActions
                            : getDefaultUserActions(category),
                        acceptanceCriteria: parsed.acceptanceCriteria,
                        status: promptSequenceNumber === 1 ? "unlocked" : "pending",
                        estimatedTime: categoryInfo.estimatedTime,
                    });

                    generatedPromptTitles.push(parsed.title);
                }

                // Update sequence progress
                sequence.totalPrompts = promptSequenceNumber;
                sequence.currentPromptIndex = promptSequenceNumber;
                await sequence.save();

            } catch (categoryError) {
                console.error(`Error generating ${category} prompts:`, categoryError);
                hasErrors = true;
                // Continue with next category
            }
        }

        // 8. Set final status
        if (promptSequenceNumber === 0) {
            sequence.status = "error";
            // Refund credits if nothing was generated
            await addCredits(session.user.email!, CREDIT_COSTS.PROMPT_SEQUENCE);
            console.log(`[Credits] Refunded ${CREDIT_COSTS.PROMPT_SEQUENCE} credits - all prompts failed`);
        } else if (hasErrors) {
            sequence.status = "partial";
        } else {
            sequence.status = "complete";
        }
        await sequence.save();

        return NextResponse.json({
            sequenceId: sequence._id,
            status: sequence.status,
            totalPrompts: sequence.totalPrompts,
            completedPrompts: 0,
            remainingCredits: creditResult.remainingCredits,
        });

    } catch (error) {
        console.error("[API] Generate prompts error:", error);
        return NextResponse.json(
            { error: "Failed to generate implementation prompts" },
            { status: 500 }
        );
    }
}

/**
 * Resume generating prompts for an incomplete sequence (FREE)
 */
async function resumeGeneration(
    sequence: InstanceType<typeof PromptSequence>,
    project: InstanceType<typeof Project>,
    suite: InstanceType<typeof BlueprintSuite>,
    userId: string,
    blueprintsForContext: BlueprintType[],
    techStack: string
) {
    // Update sequence status to generating
    sequence.status = "generating";
    await sequence.save();

    // Get existing prompts to determine what categories are already done
    const existingPrompts = await ImplementationPrompt.find({
        projectId: project._id,
    }).sort({ sequence: 1 });

    const existingCategories = new Set(existingPrompts.map(p => p.category));
    const generatedPromptTitles: string[] = existingPrompts.map(p => p.title);

    // Determine which categories still need to be generated
    const categoriesToGenerate = PROMPT_CATEGORIES.filter(
        c => !existingCategories.has(c)
    );

    console.log(`[Resume] Existing categories: ${Array.from(existingCategories).join(", ")}`);
    console.log(`[Resume] Categories to generate: ${categoriesToGenerate.join(", ")}`);

    // If no categories left, mark as complete
    if (categoriesToGenerate.length === 0) {
        sequence.status = "complete";
        sequence.totalPrompts = existingPrompts.length;
        await sequence.save();

        return NextResponse.json({
            sequenceId: sequence._id,
            status: sequence.status,
            totalPrompts: sequence.totalPrompts,
            completedPrompts: sequence.completedPrompts,
            isResume: true,
        });
    }

    // Continue generating remaining categories
    let promptSequenceNumber = existingPrompts.length;
    let hasErrors = false;

    for (const category of categoriesToGenerate) {
        try {
            const categoryInfo = CATEGORY_INFO[category];

            // Build prompt request with context from blueprints
            const promptRequest = buildImplementationPromptRequest(
                category,
                blueprintsForContext,
                project.title,
                techStack,
                generatedPromptTitles
            );

            // Call AI to generate prompts for this category
            const response = await callGLM(
                ENGINEERING_MANAGER_SYSTEM_PROMPT,
                promptRequest
            );

            // Parse the response into individual prompts
            const parsedPrompts = parsePromptResponse(response);

            // Save each prompt to database
            for (const parsed of parsedPrompts) {
                promptSequenceNumber++;

                // Determine prerequisites based on sequence
                const prerequisites = generatedPromptTitles.slice(-3); // Last 3 prompts as prereqs

                await ImplementationPrompt.create({
                    suiteId: suite._id,
                    projectId: project._id,
                    userId: userId,
                    sequence: promptSequenceNumber,
                    category,
                    title: parsed.title,
                    content: parsed.content,
                    prerequisites: [...prerequisites, ...parsed.prerequisites],
                    userActions: parsed.userActions.length > 0
                        ? parsed.userActions
                        : getDefaultUserActions(category),
                    acceptanceCriteria: parsed.acceptanceCriteria,
                    status: existingPrompts.length === 0 && promptSequenceNumber === 1 ? "unlocked" : "pending",
                    estimatedTime: categoryInfo.estimatedTime,
                });

                generatedPromptTitles.push(parsed.title);
            }

            // Update sequence progress
            sequence.totalPrompts = promptSequenceNumber;
            sequence.currentPromptIndex = promptSequenceNumber;
            await sequence.save();

            console.log(`[Resume] Generated ${category} prompts (total: ${promptSequenceNumber})`);

        } catch (categoryError) {
            console.error(`[Resume] Error generating ${category} prompts:`, categoryError);
            hasErrors = true;
            // Continue with next category
        }
    }

    // Set final status
    if (promptSequenceNumber === 0) {
        sequence.status = "error";
    } else if (hasErrors) {
        sequence.status = "partial";
    } else {
        sequence.status = "complete";
    }
    await sequence.save();

    return NextResponse.json({
        sequenceId: sequence._id,
        status: sequence.status,
        totalPrompts: sequence.totalPrompts,
        completedPrompts: sequence.completedPrompts,
        isResume: true,
    });
}

/**
 * Extract tech stack from blueprints
 */
function extractTechStack(blueprints: BlueprintType[]): string {
    const frontendPrd = blueprints.find(b => b.type === "frontend");
    const backendPrd = blueprints.find(b => b.type === "backend");

    // Try to extract from content, or use defaults
    let stack = "Next.js 15, TypeScript, Tailwind CSS, MongoDB";

    if (frontendPrd?.content) {
        const frameworkMatch = frontendPrd.content.match(/framework[:\s]*([\w\s.]+)/i);
        if (frameworkMatch) {
            stack = frameworkMatch[1].trim();
        }
    }

    return stack;
}
