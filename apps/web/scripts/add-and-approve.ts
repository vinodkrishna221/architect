import mongoose from "mongoose";
import crypto from "crypto";
import { Waitlist } from "../src/lib/models";
import { sendEmail } from "./email-helper";
import * as dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function addAndApproveUser(email: string): Promise<{ success: boolean; code?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    let user = await Waitlist.findOne({ email: normalizedEmail });

    if (user) {
        console.log(`  ℹ️  ${normalizedEmail} already exists, updating...`);
    } else {
        // Create new waitlist entry
        user = new Waitlist({
            email: normalizedEmail,
            status: "PENDING",
            createdAt: new Date()
        });
        console.log(`  ➕ ${normalizedEmail} added to waitlist`);
    }

    // Generate access code
    const accessCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    const hashedCode = await bcrypt.hash(accessCode, 10);

    // Update and approve
    user.status = "APPROVED";
    user.accessCode = hashedCode;
    await user.save();

    console.log(`  ✅ ${normalizedEmail} approved. Code: ${accessCode}`);

    // Send welcome email
    await sendEmail({
        to: normalizedEmail,
        subject: "Welcome to Architect!",
        text: `You have been approved. Your Access Code is: ${accessCode}`,
        html: `
            <h1>Welcome to Architect!</h1>
            <p>You have been approved to join the platform.</p>
            <p><strong>Your Access Code is: ${accessCode}</strong></p>
            <p>Please keep this code safe. You will need it to log in.</p>
            <p><a href="https://the-architect-demo.vercel.app/login">Login Here</a></p>
        `
    });

    return { success: true, code: accessCode };
}

async function main() {
    const emails = process.argv.slice(2);

    if (emails.length === 0) {
        console.error("Please provide at least one email address.");
        console.log("Usage: npx tsx scripts/add-and-approve.ts <email1> [email2] [email3] ...");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB\n");

        let successCount = 0;
        let failCount = 0;

        for (const email of emails) {
            try {
                const result = await addAndApproveUser(email);
                if (result.success) successCount++;
                else failCount++;
            } catch (error) {
                console.error(`  ❌ Error processing ${email}:`, error);
                failCount++;
            }
        }

        console.log(`\n--- Summary ---`);
        console.log(`✅ Approved: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);

    } catch (error) {
        console.error("Database connection error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

main();
