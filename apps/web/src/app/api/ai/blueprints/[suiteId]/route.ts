import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Blueprint, BlueprintSuite, Project } from "@/lib/models";
import mongoose from "mongoose";

interface RouteContext {
    params: Promise<{ suiteId: string }>;
}

export async function GET(req: Request, context: RouteContext) {
    try {
        // 1. Authentication check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { suiteId } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(suiteId)) {
            return NextResponse.json({ error: "Invalid suite ID" }, { status: 400 });
        }

        await dbConnect();

        // 2. Fetch suite
        const suite = await BlueprintSuite.findById(suiteId);
        if (!suite) {
            return NextResponse.json({ error: "Suite not found" }, { status: 404 });
        }

        // 3. Ownership validation via project
        const project = await Project.findOne({
            _id: suite.projectId,
            userId: session.user.id,
        });

        if (!project) {
            return NextResponse.json({ error: "Suite not found" }, { status: 404 });
        }

        // 4. Fetch all blueprints for this suite
        const blueprints = await Blueprint.find({ suiteId: suite._id }).lean();

        return NextResponse.json({
            suite: {
                id: suite._id,
                status: suite.status,
                completedCount: suite.completedCount,
                createdAt: suite.createdAt,
            },
            blueprints: blueprints.map((bp) => ({
                id: (bp._id as mongoose.Types.ObjectId).toString(),
                type: bp.type,
                title: bp.title,
                content: bp.content,
                status: bp.status,
            })),
        });
    } catch (error) {
        console.error("[API] Get blueprints error:", error);
        return NextResponse.json(
            { error: "Failed to fetch blueprints" },
            { status: 500 }
        );
    }
}
