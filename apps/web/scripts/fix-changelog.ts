import 'dotenv/config';
import mongoose from 'mongoose';
import { Changelog } from '../src/lib/models';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not set');
    process.exit(1);
}

const fixedContent = `### ✨ New Features
- AI-powered interrogation engine for gathering requirements
- Blueprint generation with 6 document types
- Real-time progress tracking during generation
- Download blueprints as .md files
- Copy to clipboard functionality
- Mobile responsive workspace with tab navigation
- Retry button for failed generations

### 🔧 Technical Improvements
- Centralized type system in \`lib/types.ts\`
- OpenRouter AI client with automatic key rotation
- Consistent userId handling across all API routes
- Security headers configured (X-Frame-Options, XSS Protection, etc.)

### 🐛 Fixes
- Fixed userId inconsistency between Project and Conversation models
- Renamed Waitlist.role to jobRole to avoid confusion with Message.role
- Consolidated duplicate type definitions`;

async function fixChangelog() {
    await mongoose.connect(MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Update the v1.0.0 changelog entry
    const result = await Changelog.updateOne(
        { version: 'v1.0.0' },
        {
            $set: {
                content: fixedContent,
                title: 'AI PRD Generator Launch'
            }
        }
    );

    console.log('Updated:', result.modifiedCount, 'document(s)');

    // Verify
    const updated = await Changelog.findOne({ version: 'v1.0.0' });
    console.log('\nUpdated content preview:');
    console.log(updated?.content?.slice(0, 200) + '...');

    await mongoose.disconnect();
    console.log('\nDone!');
}

fixChangelog().catch(console.error);
