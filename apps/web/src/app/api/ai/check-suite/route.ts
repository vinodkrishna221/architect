import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Blueprint, BlueprintSuite, Conversation } from "@/lib/models";

/**
 * GET /api/ai/check-suite?conversationId=xxx
 * 
 * Check the current suite status for a conversation without triggering generation.
 * This allows the frontend to display context-aware button states.
 */
export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const conversationId = searchParams.get("conversationId");

        if (!conversationId) {
            return NextResponse.json(
                { error: "conversationId is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Verify conversation ownership
        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: session.user.id,
        }).lean();

        if (!conversation) {
            return NextResponse.json(
                { error: "Conversation not found" },
                { status: 404 }
            );
        }

        // Find existing suite for this project
        const existingSuite = await BlueprintSuite.findOne({
            projectId: conversation.projectId,
        }).lean();

        if (!existingSuite) {
            return NextResponse.json({
                hasExisting: false,
                status: null,
                pendingCount: 0,
                failedCount: 0,
                completedCount: 0,
                totalCount: 0,
                suiteId: null,
            });
        }

        // Get blueprint counts by status
        const blueprintCounts = await Blueprint.aggregate([
            { $match: { suiteId: existingSuite._id } },
            { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);

        const statusCounts = blueprintCounts.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {} as Record<string, number>);

        return NextResponse.json({
            hasExisting: true,
            status: existingSuite.status,
            pendingCount: statusCounts["pending"] || 0,
            failedCount: statusCounts["error"] || 0,
            completedCount: statusCounts["complete"] || 0,
            generatingCount: statusCounts["generating"] || 0,
            totalCount: existingSuite.totalCount || 0,
            suiteId: existingSuite._id,
        });
    } catch (error) {
        console.error("[API] Check suite error:", error);
        return NextResponse.json(
            { error: "Failed to check suite status" },
            { status: 500 }
        );
    }
}
