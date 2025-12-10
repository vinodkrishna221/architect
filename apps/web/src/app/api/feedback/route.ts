import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Feedback } from '@/lib/models';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';

// Zod schema for feedback validation
const feedbackSchema = z.object({
    type: z.enum(["feedback", "feature", "bug"]),
    email: z.string().email("Invalid email address").max(254),
    subject: z.string().min(1, "Subject is required").max(200),
    description: z.string().min(10, "Description must be at least 10 characters").max(2000),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    browserInfo: z.string().max(500).optional(),
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
        // Request body size check
        const contentLength = request.headers.get('content-length');
        if (contentLength && parseInt(contentLength) > 10000) {
            return NextResponse.json(
                { error: 'Request body too large' },
                { status: 413 }
            );
        }

        // Rate limiting: 5 submissions per day per IP
        const ip = getClientIP(request);
        const rateLimit = checkRateLimit(ip, 5, 24 * 60 * 60 * 1000); // 5 per day

        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'Too many submissions today. Please try again tomorrow.',
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

        // Validate with Zod
        const validation = feedbackSchema.safeParse(body);
        if (!validation.success) {
            const firstIssue = validation.error.issues[0];
            return NextResponse.json(
                { error: firstIssue?.message || 'Invalid input' },
                { status: 400 }
            );
        }

        const { type, email, subject, description, priority, browserInfo } = validation.data;

        await connectDB();

        // Create feedback entry
        await Feedback.create({
            type,
            email: email.toLowerCase().trim(),
            subject: subject.trim(),
            description: description.trim(),
            priority: type === 'bug' ? (priority || 'medium') : undefined,
            browserInfo: type === 'bug' ? browserInfo : undefined,
            status: 'pending',
        });

        return NextResponse.json({
            success: true,
            message: 'Thank you for your feedback!',
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
