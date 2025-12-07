import mongoose from 'mongoose';
import { Changelog } from '../src/lib/models';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const content = `### ✨ New Features
- **Toast Notifications**: Added beautiful toast notifications for user feedback using Sonner
- Login success/error notifications
- Project creation success/error notifications  
- Project deletion success/error notifications       

### 🐛 Bug Fixes
- **Fixed project deletion**: Projects now delete correctly (was showing undefined ID error)
- **Fixed login errors**: Improved error handling for credential validation
- **Fixed JWT session**: Session now properly passes user ID using token`;

async function fix() {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI not found");
        process.exit(1);
    }
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected! Updating...");

    const result = await Changelog.updateOne({ version: 'v1.1.0' }, { content });
    console.log('Update result:', result);
    console.log('Fixed!');
    await mongoose.disconnect();
}
fix();