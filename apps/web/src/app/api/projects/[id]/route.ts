import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Project } from "@/lib/models";
import mongoose from "mongoose";

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/projects/[id] - Get a single project
export async function GET(request: Request, context: RouteContext) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }

        await dbConnect();
        const project = await Project.findOne({
            _id: id,
            userId: session.user.id
        }).lean();

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({
            project: {
                id: (project._id as mongoose.Types.ObjectId).toString(),
                title: project.title,
                description: project.description,
                status: project.status,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            }
        });
    } catch (error) {
        console.error("[API] GET /api/projects/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH /api/projects/[id] - Update a project
export async function PATCH(request: Request, context: RouteContext) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;
        const body = await request.json();
        const { title, description, status } = body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }

        await dbConnect();

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (title !== undefined) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description.trim();

        // Security: Validate status against allowed values
        if (status !== undefined) {
            const VALID_STATUSES = ["DRAFT", "GENERATING", "COMPLETED", "AWAITING_ANSWERS"];
            if (!VALID_STATUSES.includes(status)) {
                return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
            }
            updateData.status = status;
        }

        const project = await Project.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            { $set: updateData },
            { new: true }
        ).lean();

        if (!project) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({
            project: {
                id: (project._id as mongoose.Types.ObjectId).toString(),
                title: project.title,
                description: project.description,
                status: project.status,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            }
        });
    } catch (error) {
        console.error("[API] PATCH /api/projects/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(request: Request, context: RouteContext) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await context.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid project ID" }, { status: 400 });
        }

        await dbConnect();
        const result = await Project.deleteOne({
            _id: id,
            userId: session.user.id
        });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[API] DELETE /api/projects/[id] error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
