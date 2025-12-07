import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Waitlist } from '@/lib/models';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';

// Security: Zod schema for input validation
const waitlistSchema = z.object({
    email: z.string().email("Invalid email address").max(254),
    name: z.string().max(100).optional(),
    jobRole: z.string().max(50).optional(), // User's profession (Developer, Designer, etc.)
    referralSource: z.string().max(100).optional(),
    reason: z.string().max(500).optional(),
});

// Ensure mongoose connection
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
}

export async function POST(request: Request) {
    try {
        // Security: Request body size check
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10000) {
            return NextResponse.json(
                { error: 'Request body too large' },
                { status: 413 }
            );
        }

        // Rate limiting check
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, 3, 60 * 60 * 1000); // 3 per hour

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many requests. Please try again later.',
                    retryAfter: rateLimit.resetIn
                },
                {
                    status: 429,
                    headers: {
                        'Retry-After': rateLimit.resetIn.toString(),
                        'X-RateLimit-Remaining': '0',
                    }
                }
            );
        }

        const body = await request.json();

        // Security: Validate with Zod schema
        const validation = waitlistSchema.safeParse(body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return NextResponse.json(
                { error: firstIssue?.message || 'Invalid input' },
                { status: 400 }
            );
        }

        const { email, name, jobRole, referralSource, reason } = validation.data;

        await connectDB();

        // Create new waitlist entry (allow duplicates as per user request)
        const entry = await Waitlist.create({
            email: email.toLowerCase().trim(),
            name: name?.trim() || undefined,
            jobRole: jobRole || undefined,
            referralSource: referralSource || undefined,
            reason: reason?.trim() || undefined,
            status: 'PENDING',
        });

        // Get position (count of entries before this one + 1)
        const position = await Waitlist.countDocuments({
            createdAt: { $lte: entry.createdAt }
        });

        // Get total count for social proof
        const totalCount = await Waitlist.countDocuments();

        return NextResponse.json({
            success: true,
            position,
            totalCount,
        });

    } catch (error) {
        console.error('Error submitting to waitlist:', error);

        // Check for duplicate key error (email already exists)
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return NextResponse.json(
                { error: 'This email is already on the waitlist!' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
