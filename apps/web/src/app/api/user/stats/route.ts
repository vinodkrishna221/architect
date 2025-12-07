import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Project } from "@/lib/models";

// GET /api/user/stats - Get user statistics
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Get total project count
        const projectCount = await Project.countDocuments({ userId: session.user.id });

        // Get completed blueprints count
        const blueprintCount = await Project.countDocuments({
            userId: session.user.id,
            status: "COMPLETED"
        });

        // Get today's usage for rate limiting display
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const todayCount = await Project.countDocuments({
            userId: session.user.id,
            createdAt: { $gte: startOfDay }
        });

        return NextResponse.json({
            projectCount,
            blueprintCount,
            todayUsage: todayCount,
            dailyLimit: 3,
            remainingToday: Math.max(0, 3 - todayCount),
        });
    } catch (error) {
        console.error("[API] GET /api/user/stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
