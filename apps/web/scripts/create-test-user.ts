import mongoose from "mongoose";
import crypto from "crypto";
import { User, Waitlist } from "../src/lib/models";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

/**
 * Create a test user with 100 credits for development/testing purposes.
 * This creates entries in both `users` and `waitlist` collections.
 */
async function createTestUser() {
    const TEST_EMAIL = "testuser@architect.dev";
    const TEST_NAME = "Test User";

    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB\n");

        // Check if test user already exists in User collection
        let user = await User.findOne({ email: TEST_EMAIL });

        if (user) {
            console.log(`ℹ️  Test user already exists, updating credits to 100...`);
            user.credits = 100;
            await user.save();
        } else {
            // Create new user
            user = new User({
                name: TEST_NAME,
                email: TEST_EMAIL,
                credits: 100,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await user.save();
            console.log(`✅ Created test user in 'users' collection`);
        }

        // Also create/update waitlist entry for login access
        let waitlistEntry = await Waitlist.findOne({ email: TEST_EMAIL });

        // Generate access code for login
        const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        const hashedCode = await bcrypt.hash(accessCode, 10);

        if (waitlistEntry) {
            console.log(`ℹ️  Waitlist entry exists, updating...`);
            waitlistEntry.status = "APPROVED";
            waitlistEntry.credits = 100;
            waitlistEntry.accessCode = hashedCode;
            await waitlistEntry.save();
        } else {
            waitlistEntry = new Waitlist({
                email: TEST_EMAIL,
                name: TEST_NAME,
                status: "APPROVED",
                credits: 100,
                accessCode: hashedCode,
                createdAt: new Date(),
            });
            await waitlistEntry.save();
            console.log(`✅ Created test user in 'waitlist' collection`);
        }

        console.log("\n" + "=".repeat(50));
        console.log("🎉 TEST USER CREATED SUCCESSFULLY");
        console.log("=".repeat(50));
        console.log(`📧 Email:       ${TEST_EMAIL}`);
        console.log(`🔑 Access Code: ${accessCode}`);
        console.log(`💰 Credits:     100`);
        console.log("=".repeat(50));
        console.log("\nUse these credentials to log in at /login");

    } catch (error) {
        console.error("❌ Error creating test user:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\nDisconnected from MongoDB");
    }
}

createTestUser();
