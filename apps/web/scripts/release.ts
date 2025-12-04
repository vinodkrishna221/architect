import mongoose from "mongoose";
import { Waitlist, Changelog } from "../src/lib/models";
import { sendEmail } from "./email-helper";
import * as dotenv from "dotenv";
import * as readline from "readline";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query: string): Promise<string> {
    return new Promise(resolve => rl.question(query, resolve));
}

async function releaseUpdate() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");

        console.log("\n--- Create New Release ---\n");

        const version = await askQuestion("Version (e.g., v1.0.0): ");
        const title = await askQuestion("Title (e.g., New Dashboard): ");
        const content = await askQuestion("Content (Markdown supported): ");

        if (!version || !title || !content) {
            console.error("All fields are required.");
            process.exit(1);
        }

        // 1. Create Changelog
        const changelog = await Changelog.create({
            version,
            title,
            content,
            date: new Date()
        });
        console.log(`\nChangelog created: ${changelog.version} - ${changelog.title}`);

        // 2. Notify Users
        const users = await Waitlist.find({ status: "APPROVED" });
        console.log(`\nFound ${users.length} approved users.`);

        console.log("\n--- Sending Notifications ---\n");

        for (const user of users) {
            await sendEmail({
                to: user.email!,
                subject: `New Update: ${title}`,
                text: `Check out the new update ${version}! View full changelog at /changelog`,
                html: `
                    <h1>New Update: ${title}</h1>
                    <p><strong>Version: ${version}</strong></p>
                    <p>We've just released a new update!</p>
                    <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        ${content}
                    </div>
                    <p><a href="https://the-architect-demo.vercel.app/changelog">View Full Changelog</a></p>
                `
            });
            console.log(`  ✅ Notified: ${user.email}`);
        }

        console.log("\nRelease process completed successfully!");

    } catch (error) {
        console.error("Error creating release:", error);
    } finally {
        await mongoose.disconnect();
        rl.close();
    }
}

releaseUpdate();
