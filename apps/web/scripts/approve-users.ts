import mongoose from "mongoose";
import { Waitlist } from "../src/lib/models";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function approveUser(email: string) {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");

        const user = await Waitlist.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        if (user.status === "APPROVED" && user.accessCode) {
            console.log(`User ${email} is already approved with code: ${user.accessCode}`);
            process.exit(0);
        }

        // Generate 6-digit random code
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

        user.status = "APPROVED";
        user.accessCode = accessCode;
        await user.save();

        console.log(`\nSUCCESS! User ${email} approved.`);
        console.log(`Access Code: ${accessCode}`);
        console.log(`\n[MOCK EMAIL SENT]`);
        console.log(`To: ${email}`);
        console.log(`Subject: Welcome to Architect!`);
        console.log(`Body: You have been approved. Your Access Code is: ${accessCode}`);

    } catch (error) {
        console.error("Error approving user:", error);
    } finally {
        await mongoose.disconnect();
    }
}

const email = process.argv[2];

if (!email) {
    console.error("Please provide an email address.");
    console.log("Usage: npx tsx scripts/approve-users.ts <email>");
    process.exit(1);
}

approveUser(email);
