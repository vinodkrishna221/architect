import mongoose from "mongoose";
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
        const hashedCode = await bcrypt.hash(accessCode, 10);

        user.status = "APPROVED";
        user.accessCode = hashedCode;
        await user.save();

        console.log(`\nSUCCESS! User ${email} approved.`);
        console.log(`Access Code: ${accessCode}`);

        await sendEmail({
            to: email,
            subject: "Welcome to Architect!",
            text: `You have been approved. Your Access Code is: ${accessCode}`,
            html: `
                <h1>Welcome to Architect!</h1>
                <p>You have been approved to join the platform.</p>
                <p><strong>Your Access Code is: ${accessCode}</strong></p>
                <p>Please keep this code safe. You will need it to log in.</p>
                <p><a href="https://architect-web.vercel.app/login">Login Here</a></p>
            `
        });

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
