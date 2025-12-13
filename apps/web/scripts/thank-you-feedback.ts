import mongoose from 'mongoose';
import { Waitlist } from '../src/lib/models';
import { sendEmail } from './email-helper';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const FEEDBACK_URL = 'https://the-architect-demo.vercel.app/feedback';
const APP_URL = 'https://the-architect-demo.vercel.app';

async function sendThankYouAndFeedbackRequest() {
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI not found");
        process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected!\n");

    // Get all approved users
    const users = await Waitlist.find({ status: "APPROVED" });
    console.log(`📋 Found ${users.length} approved users.\n`);

    if (users.length === 0) {
        console.log("No approved users found. Exiting...");
        await mongoose.disconnect();
        return;
    }

    console.log("--- Sending Thank You & Feedback Request Emails ---\n");

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
        const userName = user.name || 'there';

        try {
            await sendEmail({
                to: user.email!,
                subject: `💙 Thank You for Trying The Architect! We'd Love Your Feedback`,
                text: `
Hi ${userName},

Thank you so much for being one of the first to try The Architect! Your early support means the world to us.

We're constantly working to improve the experience, and your feedback is invaluable in shaping the future of this product.

Could you take a moment to share your thoughts? Whether it's a feature request, bug report, or general feedback - we want to hear it all!

Share your feedback: ${FEEDBACK_URL}

Thank you again for being part of this journey with us!

Warm regards,
The Architect Team by Codedale
                `.trim(),
                html: `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h1 style="color: #3b82f6; margin-bottom: 24px;">💙 Thank You for Trying The Architect!</h1>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Hi <strong>${userName}</strong>,
                        </p>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Thank you so much for being one of the first to try <strong>The Architect</strong>! 
                            Your early support means the world to us. 🙏
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 24px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #3b82f6;">
                            <p style="color: #1e40af; font-size: 16px; margin: 0; line-height: 1.6;">
                                We're constantly working to improve the experience, and 
                                <strong>your feedback is invaluable</strong> in shaping the future of this product.
                            </p>
                        </div>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Could you take a moment to share your thoughts? Whether it's:
                        </p>
                        
                        <ul style="color: #374151; font-size: 16px; line-height: 1.8; padding-left: 24px;">
                            <li>💡 <strong>Feature requests</strong> - What would make The Architect even better?</li>
                            <li>🐛 <strong>Bug reports</strong> - Did something not work as expected?</li>
                            <li>💬 <strong>General feedback</strong> - What do you love? What could improve?</li>
                        </ul>
                        
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${FEEDBACK_URL}" 
                               style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                                📝 Share Your Feedback
                            </a>
                        </div>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Thank you again for being part of this journey with us!
                        </p>
                        
                        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                            Warm regards,<br/>
                            <strong style="color: #3b82f6;">The Architect Team</strong> by Codedale
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
                        
                        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                            <a href="${APP_URL}" style="color: #3b82f6; text-decoration: none;">The Architect</a> - 
                            AI-Powered PRD Generator by <a href="https://codedale.tech" style="color: #3b82f6; text-decoration: none;">Codedale</a>
                        </p>
                    </div>
                `
            });
            console.log(`  ✅ Sent to: ${user.email}`);
            successCount++;
        } catch (err) {
            console.log(`  ❌ Failed to send to: ${user.email}`, err);
            failCount++;
        }
    }

    console.log("\n--- Summary ---");
    console.log(`✅ Successfully sent: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log("\n🎉 Thank you & feedback request emails completed!");

    await mongoose.disconnect();
}

sendThankYouAndFeedbackRequest();
