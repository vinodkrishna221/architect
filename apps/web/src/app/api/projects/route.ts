import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Project } from "@/lib/models";
import mongoose from "mongoose";

// Valid project types for dynamic PRD generation
const PROJECT_TYPES = ["saas", "marketplace", "mobile", "ecommerce", "internal", "api", "ai-product", "cli", "iot"] as const;

// Security: Zod schema for project input validation
const createProjectSchema = z.object({
    title: z.string().min(1, "Title is required").max(200).trim(),
    description: z.string().max(2000).optional(),
    projectType: z.enum(PROJECT_TYPES).optional().default("saas"),
});

// GET /api/projects - Fetch all projects for the authenticated user
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const rawProjects = await Project.find({ userId: session.user.id })
            .sort({ updatedAt: -1 })
            .lean();

        // Map _id to id for frontend compatibility
        const projects = rawProjects.map((p) => ({
            id: (p._id as mongoose.Types.ObjectId).toString(),
            title: p.title,
            description: p.description,
            projectType: p.projectType || "saas",
            status: p.status,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
        }));

        return NextResponse.json({ projects });
    } catch (error) {
        console.error("[API] GET /api/projects error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST /api/projects - Create a new project (with 3/day rate limit)
export async function POST(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Security: Request body size check
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10000) {
            return NextResponse.json(
                { error: 'Request body too large' },
                { status: 413 }
            );
        }

        const body = await request.json();

        // Security: Validate with Zod schema
        const validation = createProjectSchema.safeParse(body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return NextResponse.json(
                { error: firstIssue?.message || "Invalid input" },
                { status: 400 }
            );
        }

        const { title, description, projectType } = validation.data;

        await dbConnect();

        // Rate limit: 3 projects per day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayCount = await Project.countDocuments({
            userId: session.user.id,
            createdAt: { $gte: startOfDay }
        });

        if (todayCount >= 3) {
            return NextResponse.json(
                { error: "Daily limit reached. You can create up to 3 projects per day." },
                { status: 429 }
            );
        }

        // Create the project
        const project = await Project.create({
            userId: session.user.id,
            title: title.trim(),
            description: description?.trim() || "",
            projectType: projectType,
            status: "DRAFT",
        });

        return NextResponse.json({
            project: {
                id: project._id.toString(),
                title: project.title,
                description: project.description,
                projectType: project.projectType,
                status: project.status,
                createdAt: project.createdAt,
                updatedAt: project.updatedAt,
            },
        }, { status: 201 });
    } catch (error) {
        console.error("[API] POST /api/projects error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
