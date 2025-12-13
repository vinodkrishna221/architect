import mongoose from 'mongoose';
import { Waitlist, Changelog } from '../src/lib/models';
import { sendEmail } from './email-helper';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const version = 'v1.4.0';
const title = 'AI Streaming & PRD Generation Improvements';
const content = `### ✨ New Features

**Real-time AI Streaming**
- AI responses now stream character-by-character like ChatGPT/Claude
- Messages saved immediately to database before AI call
- Tab switch or minimize no longer loses your response
- Focus-sync refreshes conversation when returning to tab

**Dynamic PRD Generation**
- Select your project type at creation: SaaS, Marketplace, Mobile, E-commerce, AI Product, etc.
- PRDs now customized to your project type
- Marketplace projects get Trust & Safety + Payment Integration PRDs
- Mobile projects get Push Notifications + Mobile Architecture PRDs
- AI Product projects get Prompt Engineering PRDs

**Project Type Selector**
- Beautiful dropdown in New Project modal
- 9 project types with descriptions
- Determines which PRD documents get generated

### 🐛 Bug Fixes

**Credit Protection (Critical)**
- Fixed: Credits no longer deducted before generation completes
- Fixed: Full refund if all PRD generation fails
- Fixed: Retry button no longer charges twice
- Fixed: Duplicate generation requests return existing suite for free

**AI Reliability**
- API now tries all available keys before failing
- Exponential backoff on rate limits
- Better error recovery across all AI calls

**Profile Page**
- Now shows actual credit balance instead of "3/3"
- Color-coded credit display (green/amber/red)

### 🎨 UI Improvements
- Dynamic Blueprint tabs (shows only generated PRDs)
- Progress bar uses actual count from API
- Better icons for new PRD types (Payments, Mobile, IoT, etc.)`;

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
