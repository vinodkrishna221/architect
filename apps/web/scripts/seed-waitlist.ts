import mongoose from "mongoose";
import { Waitlist } from "../src/lib/models";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("Please define the MONGODB_URI environment variable inside .env.local");
    process.exit(1);
}

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI!);
        console.log("Connected to MongoDB");

        const email = "cinetechp@gmail.com"; // Default test email

        // Check if exists
        const existing = await Waitlist.findOne({ email });
        if (existing) {
            console.log(`Email ${email} already in waitlist.`);
        } else {
            await Waitlist.create({
                email,
                status: "APPROVED"
            });
            console.log(`Added ${email} to waitlist.`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding waitlist:", error);
        process.exit(1);
    }
}

seed();
