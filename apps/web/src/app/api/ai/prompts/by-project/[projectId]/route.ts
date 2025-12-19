import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import {
    Project,
    PromptSequence,
    ImplementationPrompt,
} from "@/lib/models";
import { getCreditBalance } from "@/lib/credits";

/**
 * GET /api/ai/prompts/[projectId]
 * Fetch implementation prompts for a project along with user credits
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json(
                { error: "projectId is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Validate project ownership
        const project = await Project.findOne({
            _id: projectId,
            userId: session.user.id,
        });

        if (!project) {
            return NextResponse.json(
                { error: "Project not found or unauthorized" },
                { status: 404 }
            );
        }

        // Get user's credit balance
        const userCredits = await getCreditBalance(session.user.email);

        // Fetch prompt sequence for this project
        const sequence = await PromptSequence.findOne({
            projectId: project._id,
        }).lean();

        // Fetch all prompts for this project
        const prompts = await ImplementationPrompt.find({
            projectId: project._id,
        })
            .sort({ sequence: 1 })
            .lean();

        // Transform prompts to include id field
        const transformedPrompts = prompts.map((p) => ({
            id: p._id.toString(),
            suiteId: p.suiteId?.toString(),
            projectId: p.projectId?.toString(),
            sequence: p.sequence,
            category: p.category,
            title: p.title,
            content: p.content,
            prerequisites: p.prerequisites,
            userActions: p.userActions,
            acceptanceCriteria: p.acceptanceCriteria,
            status: p.status,
            estimatedTime: p.estimatedTime,
            completedAt: p.completedAt,
        }));

        // Transform sequence if exists
        const transformedSequence = sequence
            ? {
                id: (sequence as { _id: { toString: () => string } })._id.toString(),
                projectId: (sequence as { projectId: { toString: () => string } }).projectId.toString(),
                suiteId: (sequence as { suiteId?: { toString: () => string } }).suiteId?.toString(),
                status: (sequence as { status: string }).status,
                totalPrompts: (sequence as { totalPrompts: number }).totalPrompts,
                completedPrompts: (sequence as { completedPrompts: number }).completedPrompts,
                currentPromptIndex: (sequence as { currentPromptIndex: number }).currentPromptIndex,
            }
            : null;

        return NextResponse.json({
            sequence: transformedSequence,
            prompts: transformedPrompts,
            projectTitle: project.title,
            userCredits,
        });
    } catch (error) {
        console.error("[API] GET /api/ai/prompts/[projectId] error:", error);
        return NextResponse.json(
            { error: "Failed to fetch prompts" },
            { status: 500 }
        );
    }
}
