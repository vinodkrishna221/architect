/**
 * Script to check all users and their credit status
 */
import mongoose from 'mongoose';
import { User, Waitlist } from '../src/lib/models';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function check() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!\n");

    // Check Users collection
    console.log("=== USERS COLLECTION ===");
    const users = await User.find({}).lean();
    console.log(`Total users: ${users.length}\n`);
    for (const user of users) {
        const u = user as { _id: mongoose.Types.ObjectId; email?: string; name?: string; credits?: number };
        console.log(`  ID: ${u._id}`);
        console.log(`  Email: ${u.email}`);
        console.log(`  Name: ${u.name || 'N/A'}`);
        console.log(`  Credits: ${u.credits ?? 'NOT SET'}`);
        console.log('');
    }

    // Check Waitlist collection
    console.log("=== WAITLIST COLLECTION ===");
    const waitlist = await Waitlist.find({}).lean();
    console.log(`Total waitlist entries: ${waitlist.length}\n`);
    for (const entry of waitlist) {
        const w = entry as { _id: mongoose.Types.ObjectId; email?: string; name?: string; status?: string };
        console.log(`  Email: ${w.email}`);
        console.log(`  Name: ${w.name || 'N/A'}`);
        console.log(`  Status: ${w.status}`);
        console.log('');
    }

    await mongoose.disconnect();
}

check();
