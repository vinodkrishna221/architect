import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Conversation, BlueprintSuite, Blueprint } from "@/lib/models";

interface RouteParams {
    params: Promise<{ projectId: string }>;
}

/**
 * GET /api/ai/conversation/[projectId]
 * Fetches the existing conversation and blueprints for a project.
 * This allows users to continue where they left off.
 */
export async function GET(req: Request, { params }: RouteParams) {
    try {
        // 1. Authentication check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { projectId } = await params;

        if (!projectId) {
            return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
        }

        await dbConnect();

        // 2. Find conversation for this project owned by this user
        const conversation = await Conversation.findOne({
            projectId,
            userId: session.user.id, // Security: Only return user's own conversation
        }).lean();

        if (!conversation) {
            // No conversation exists yet - this is expected for new projects
            return NextResponse.json({ exists: false }, { status: 200 });
        }

        // 3. Also fetch any existing blueprints for this project
        // Use conversationId to ensure the suite belongs to this user's conversation
        const suite = await BlueprintSuite.findOne({
            projectId,
            conversationId: conversation._id, // Security: Ensure suite is linked to user's conversation
        }).lean();

        let blueprints: Array<{
            id: string;
            type: string;
            title: string;
            content: string;
            status: string;
        }> = [];

        if (suite) {
            const blueprintDocs = await Blueprint.find({
                suiteId: suite._id,
            }).lean();

            blueprints = blueprintDocs.map((bp) => ({
                id: bp._id.toString(),
                type: bp.type,
                title: bp.title,
                content: bp.content || "",
                status: bp.status,
            }));
        }

        // 4. Return complete conversation state
        return NextResponse.json({
            exists: true,
            conversationId: conversation._id.toString(),
            messages: conversation.messages.map((msg: { role: string; content: string; category?: string; _id?: { toString(): string } }) => ({
                id: msg._id?.toString() || `msg-${Date.now()}`,
                role: msg.role,
                content: msg.content,
                category: msg.category,
            })),
            questionsAsked: conversation.questionsAsked,
            isComplete: conversation.status === "complete",
            isReadyForBlueprints: conversation.isReadyForBlueprints,
            // Include blueprint data if available
            suiteId: suite?._id?.toString() || null,
            blueprints,
            suiteStatus: suite?.status || null,
        });
    } catch (error) {
        console.error("[API] Get conversation error:", error);
        return NextResponse.json(
            { error: "Failed to fetch conversation" },
            { status: 500 }
        );
    }
}
