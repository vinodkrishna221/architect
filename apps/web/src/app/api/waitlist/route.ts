import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Waitlist } from '@/lib/models';
import { checkRateLimit, getClientIP } from '@/lib/rate-limiter';

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
        const { email, name, role, referralSource, reason } = body;

        // Validate email
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        await connectDB();

        // Create new waitlist entry (allow duplicates as per user request)
        const entry = await Waitlist.create({
            email: email.toLowerCase().trim(),
            name: name?.trim() || undefined,
            role: role || undefined,
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
