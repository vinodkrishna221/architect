import mongoose from 'mongoose';
import { Waitlist, Changelog } from '../src/lib/models';
import { sendEmail } from './email-helper';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const version = 'v1.3.0';
const title = 'Feedback System & User Engagement';
const content = `### ✨ New Features

**Feedback Page**
- New /feedback page for user submissions
- Submit general feedback, feature requests, or bug reports
- Priority levels for bug reporting
- Rate-limited to prevent spam (5 per day)

**Credit System**
- Introduced a new credit-based usage system
- Beta users start with **30 credits**
- Interview messages cost 0.1 credits each
- PRD Blueprint Suite generation costs 3 credits
- Project creation remains **FREE**

**Pricing Page**
- New /pricing page with credit system details
- Shows all credit costs upfront
- Highlights beta tester benefits

### 🐛 Bug Fixes

**Chat Persistence**
- Fixed bug where conversation history was lost when navigating away
- Messages and blueprints now persist across sessions
- Users can continue exactly where they left off

### 🎨 UI Improvements
- Added "Coming Soon" badge for upcoming AI edit feature
- Beautiful pricing cards with smooth animations
- Feedback page with tabbed type selector`;

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
