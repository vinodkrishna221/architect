import mongoose from 'mongoose';
import { Waitlist, Changelog } from '../src/lib/models';
import { sendEmail } from './email-helper';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const version = 'v1.6.0';
const title = 'Implementation Prompts & Enhanced Chat Experience';
const content = `### 🚀 Major Feature: Implementation Prompts

**AI-Powered Prompt Generation**
- New "Implementation" tab after blueprint generation
- Generate step-by-step coding prompts for AI assistants (Cursor, Claude)
- Organized into 5 categories: Setup → Core → Features → Polish → Launch
- Costs 2 credits per sequence generation

**Smart Prompt Cards**
- One-click "Copy for Cursor" with full project context included
- Track progress: Pending → Unlocked → In Progress → Completed
- Skip prompts you don't need
- Prerequisite checker shows what to complete first

**Regenerate Anytime**
- Not happy with a prompt? Regenerate for just 0.2 credits
- Typewriter effect while generating
- Terminal-style prompt display

### ✨ Chat Window Enhancements

**Category Progress Indicator**
- Visual progress bar in interview header
- Four animated icons: Users → Problem → Technical → Scope
- See which phase of interview you're in

**Smart Scroll & Loading**
- "New messages" button when you scroll up
- Bot avatar glows during "Thinking..." state
- Keyboard hint: "Shift+Enter for new line"

### 🎨 UI Improvements

**Visual Depth & Hierarchy**
- Gradient fade overlay above input area
- Enhanced completion banner with animated sweep
- Sparkles ✨ effect on interview completion

### 🐛 Bug Fixes

**Dock Overlap Fixed**
- Dock no longer covers Blueprints/Implementation tabs`;




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
