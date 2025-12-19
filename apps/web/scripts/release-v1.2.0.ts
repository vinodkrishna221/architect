import mongoose from 'mongoose';
import { Waitlist, Changelog } from '../src/lib/models';
import { sendEmail } from './email-helper';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const version = 'v1.5.0';
const title = 'Blueprint Generation UX & Reliability';
const content = `### ✨ New Features

**Context-Aware Blueprint Generation**
- Button now shows current state: "Generate Blueprints" or "Resume Generation"
- Interrupted generation? Click "Resume" to continue FOR FREE
- Clear info text explains what will happen before you click
- "Uses 3 credits" for fresh generation, "No additional cost" for resume

**Resume Mode**
- If generation stopped midway, pending PRDs are now detected automatically
- Click Resume to continue from where you left off
- No duplicate charges - existing suites are reused

**Improved Pending State**
- PRDs waiting to generate now show "Queued for generation"
- Clear instructions: "Click Resume Generation to continue"

### 🐛 Bug Fixes

**API Key Reliability**
- Expanded support from 3 to 10 API keys for better rate limit handling
- Added retry logic with key rotation to streaming AI calls
- Better recovery when hitting rate limits

**Project Type Validation**
- Fixed: Educational project type now properly validated in API

### 🎨 UI Improvements
- Resume button uses amber/orange color to distinguish from fresh generation
- Loading state while checking existing suite status
- Better visual hierarchy in generation button`;


async function release() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected!");

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
        try {
            await sendEmail({
                to: user.email!,
                subject: `🚀 New Update: ${title}`,
                text: `Check out the new update ${version}! View full changelog at /changelog`,
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #3b82f6;">🚀 New Update: ${title}</h1>
                        <p style="color: #6b7280; font-size: 14px;"><strong>Version: ${version}</strong></p>
                        <div style="background: #f9fafb; padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                            ${content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/### (.*?)\n/g, '<h3 style="color: #1f2937; margin-top: 16px;">$1</h3>')}
                        </div>
                        <p><a href="https://the-architect-demo.vercel.app/changelog" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none;">View Full Changelog</a></p>
                        <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">The Architect by Codedale</p>
                    </div>
                `
            });
            console.log(`  ✅ Notified: ${user.email}`);
        } catch (err) {
            console.log(`  ❌ Failed to notify: ${user.email}`, err);
        }
    }

    console.log("\n✅ Release process completed successfully!");
    await mongoose.disconnect();
}

release();
