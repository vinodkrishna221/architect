import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { Waitlist } from '@/lib/models';

// Ensure mongoose connection
async function connectDB() {
    if (mongoose.connection.readyState >= 1) return;

    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error('MONGODB_URI not configured');
    }
    await mongoose.connect(uri);
}

// Cache for count to reduce DB calls
let cachedCount: { value: number; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
    try {
        // Check cache first
        const now = Date.now();
        if (cachedCount && (now - cachedCount.timestamp) < CACHE_TTL) {
            return NextResponse.json({
                count: cachedCount.value,
                cached: true
            });
        }

        await connectDB();

        const count = await Waitlist.countDocuments();

        // Update cache
        cachedCount = { value: count, timestamp: now };

        return NextResponse.json({
            count,
            cached: false
        });

    } catch (error) {
        console.error('Error fetching waitlist count:', error);
        return NextResponse.json(
            { error: 'Failed to fetch count', count: 0 },
            { status: 500 }
        );
    }
}
