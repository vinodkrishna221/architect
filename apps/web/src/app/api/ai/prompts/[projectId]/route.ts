import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Project, ImplementationPrompt, PromptSequence, User } from "@/lib/models";

interface RouteParams {
    params: Promise<{ projectId: string }>;
}

/**
 * GET /api/ai/prompts/[projectId]
 * Get all implementation prompts for a project
 */
export async function GET(req: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
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

        // Fetch prompt sequence
        const sequence = await PromptSequence.findOne({ projectId });

        if (!sequence) {
            return NextResponse.json({
                sequence: null,
                prompts: [],
                message: "No implementation prompts generated yet",
            });
        }

        // Fetch all prompts for this project, ordered by sequence
        const prompts = await ImplementationPrompt.find({ projectId })
            .sort({ sequence: 1 })
            .lean();

        // Transform for client
        const transformedPrompts = prompts.map(prompt => ({
            id: prompt._id.toString(),
            sequence: prompt.sequence,
            category: prompt.category,
            title: prompt.title,
            content: prompt.content,
            prerequisites: prompt.prerequisites || [],
            userActions: prompt.userActions || [],
            acceptanceCriteria: prompt.acceptanceCriteria || [],
            status: prompt.status,
            completedAt: prompt.completedAt,
            estimatedTime: prompt.estimatedTime,
        }));

        // Fetch user for credits
        const user = await User.findById(session.user.id);

        return NextResponse.json({
            projectTitle: project.title,
            userCredits: user?.credits || 0,
            sequence: {
                id: sequence._id.toString(),
                status: sequence.status,
                totalPrompts: sequence.totalPrompts,
                completedPrompts: sequence.completedPrompts,
                currentPromptIndex: sequence.currentPromptIndex,
            },
            prompts: transformedPrompts,
        });

    } catch (error) {
        console.error("[API] Get prompts error:", error);
        return NextResponse.json(
            { error: "Failed to fetch implementation prompts" },
            { status: 500 }
        );
    }
}
