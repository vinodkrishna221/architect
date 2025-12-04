import nodemailer from "nodemailer";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const {
    EMAIL_SERVER, // Support for connection string (e.g., smtp://user:pass@host:port)
    EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD,
    EMAIL_FROM
} = process.env;

if (!EMAIL_SERVER && (!EMAIL_SERVER_HOST || !EMAIL_FROM)) {
    console.warn("⚠️  Email configuration missing. Emails will NOT be sent.");
}

let transporter: nodemailer.Transporter;

if (EMAIL_SERVER) {
    // Parse the EMAIL_SERVER URL format (smtp://user:pass@host:port)
    // Nodemailer doesn't directly support URL strings, so we parse it manually
    try {
        const url = new URL(EMAIL_SERVER);
        const transportConfig: any = {
            host: url.hostname,
            port: Number(url.port) || 587,
            secure: url.port === '465', // Use TLS for port 465
            tls: {
                rejectUnauthorized: false
            }
        };

        if (url.username && url.password) {
            transportConfig.auth = {
                user: decodeURIComponent(url.username),
                pass: decodeURIComponent(url.password),
            };
        }

        transporter = nodemailer.createTransport(transportConfig);
    } catch (parseError) {
        console.error("❌ Failed to parse EMAIL_SERVER URL:", parseError);
        throw new Error("Invalid EMAIL_SERVER format. Expected: smtp://user:pass@host:port");
    }
} else {
    const transportConfig: any = {
        host: EMAIL_SERVER_HOST,
        port: Number(EMAIL_SERVER_PORT) || 587,
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === "production"
        }
    };

    if (EMAIL_SERVER_USER && EMAIL_SERVER_PASSWORD) {
        transportConfig.auth = {
            user: EMAIL_SERVER_USER,
            pass: EMAIL_SERVER_PASSWORD,
        };
    }

    transporter = nodemailer.createTransport(transportConfig);
}

export async function sendEmail({ to, subject, text, html }: { to: string; subject: string; text: string; html?: string }) {
    if (!EMAIL_SERVER && !EMAIL_SERVER_HOST) {
        console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        // Verify SMTP connection first
        await transporter.verify();
        console.log(`📧 SMTP connection verified. Sending to: ${to}`);
        console.log(`📧 From: ${EMAIL_FROM}`);

        const info = await transporter.sendMail({
            from: EMAIL_FROM,
            to,
            subject,
            text,
            html: html || text,
        });
        console.log(`✅ Email sent to ${to}: ${info.messageId}`);
        console.log(`📧 Response: ${info.response}`);
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error);
    }
}
