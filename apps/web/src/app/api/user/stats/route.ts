import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Project } from "@/lib/models";
import { getCreditBalance, DEFAULT_CREDITS } from "@/lib/credits";

// GET /api/user/stats - Get user statistics
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
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

        // Get actual credit balance from Waitlist collection
        const credits = await getCreditBalance(session.user.email);

        return NextResponse.json({
            projectCount,
            blueprintCount,
            // Credit system (not daily limits - actual credits)
            credits,
            maxCredits: DEFAULT_CREDITS, // 30 for beta users
        });
    } catch (error) {
        console.error("[API] GET /api/user/stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
