import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { ImplementationPrompt, PromptSequence, Project } from "@/lib/models";
import type { PromptStatus } from "@/lib/types";

interface RouteParams {
    params: Promise<{ promptId: string }>;
}

interface UpdateStatusRequest {
    status: PromptStatus;
}

/**
 * PATCH /api/ai/prompts/[promptId]/status
 * Update the completion status of an implementation prompt
 */
export async function PATCH(req: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { promptId } = await params;
        const { status }: UpdateStatusRequest = await req.json();

        if (!promptId) {
            return NextResponse.json(
                { error: "promptId is required" },
                { status: 400 }
            );
        }

        const validStatuses: PromptStatus[] = ["pending", "unlocked", "in_progress", "completed", "skipped"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: "Invalid status value" },
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

        // Check prerequisites if marking as in_progress or completed
        if (status === "in_progress" || status === "completed") {
            const prereqTitles = prompt.prerequisites || [];

            if (prereqTitles.length > 0) {
                const completedPrereqs = await ImplementationPrompt.countDocuments({
                    projectId: prompt.projectId,
                    title: { $in: prereqTitles },
                    status: { $in: ["completed", "skipped"] },
                });

                if (completedPrereqs < prereqTitles.length) {
                    return NextResponse.json({
                        error: "Prerequisites not complete",
                        message: "Please complete or skip the prerequisite prompts first",
                        incompletePrerequisites: prereqTitles,
                    }, { status: 400 });
                }
            }
        }

        // Update status
        const previousStatus = prompt.status;
        prompt.status = status;

        if (status === "completed") {
            prompt.completedAt = new Date();
        }

        await prompt.save();

        // Update sequence stats
        const sequence = await PromptSequence.findOne({ projectId: prompt.projectId });
        if (sequence) {
            if (status === "completed" && previousStatus !== "completed") {
                sequence.completedPrompts = (sequence.completedPrompts || 0) + 1;
            } else if (previousStatus === "completed" && status !== "completed") {
                sequence.completedPrompts = Math.max(0, (sequence.completedPrompts || 0) - 1);
            }

            // Check if all prompts are done
            if (sequence.completedPrompts >= sequence.totalPrompts) {
                sequence.status = "complete";
            }

            await sequence.save();
        }

        // Unlock next prompt if this one was completed
        if (status === "completed" || status === "skipped") {
            const nextPrompt = await ImplementationPrompt.findOne({
                projectId: prompt.projectId,
                sequence: prompt.sequence + 1,
                status: "pending",
            });

            if (nextPrompt) {
                nextPrompt.status = "unlocked";
                await nextPrompt.save();
            }
        }

        return NextResponse.json({
            success: true,
            promptId: prompt._id.toString(),
            status: prompt.status,
            completedAt: prompt.completedAt,
            sequenceProgress: sequence ? {
                completedPrompts: sequence.completedPrompts,
                totalPrompts: sequence.totalPrompts,
            } : null,
        });

    } catch (error) {
        console.error("[API] Update prompt status error:", error);
        return NextResponse.json(
            { error: "Failed to update prompt status" },
            { status: 500 }
        );
    }
}
