/**
 * Migration script to add 30 credits to all waitlist users
 */
import mongoose from 'mongoose';
import { Waitlist } from '../src/lib/models';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const DEFAULT_CREDITS = 30;

async function migrate() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

    // Find all waitlist users without credits field or with less than 30
    const result = await Waitlist.updateMany(
        {
            $or: [
                { credits: { $exists: false } },
                { credits: { $lt: DEFAULT_CREDITS } }
            ]
        },
        {
            $set: { credits: DEFAULT_CREDITS }
        }
    );

    console.log(`\n✅ Migration complete!`);
    console.log(`   Updated ${result.modifiedCount} waitlist users to have ${DEFAULT_CREDITS} credits`);
    console.log(`   Matched ${result.matchedCount} users total`);

    // Show current state of all waitlist users
    const users = await Waitlist.find({}).select('email credits status').lean();
    console.log('\n--- Current Waitlist Credits ---');
    for (const user of users) {
        const u = user as { email?: string; credits?: number; status?: string };
        console.log(`   ${u.email}: ${u.credits ?? 'NOT SET'} credits (${u.status})`);
    }

    await mongoose.disconnect();
}

migrate();
