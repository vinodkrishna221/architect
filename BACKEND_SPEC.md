Backend Technical Spec: "The Architect" Core
1. Overview
This document defines the server-side architecture, database schemas, and business logic for "The Architect." The system runs entirely within the Next.js 15 App Router environment using Server Actions. There is no separate API server.

2. Tech Stack (Backend Strict)
Runtime: Node.js (Next.js Server Actions).

Database: MongoDB Atlas (Multi-cloud).

ORM: Mongoose (Strict Schema Validation).

Validation: Zod (Runtime data validation).

Auth: NextAuth v5 (Beta) / Auth.js.

AI Engine: Vercel AI SDK (ai package) + Anthropic Claude 3.5 Sonnet.

Rate Limiting: Custom implementation via User Credits in MongoDB.

3. Database Architecture (Mongoose)
Critical Pattern: Use the Singleton Connection Pattern to prevent connection pool exhaustion in Serverless/HMR environments.

A. Connection Module (src/lib/db.ts)
TypeScript

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Global caching for HMR (Hot Module Replacement)
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}

export default connectDB;
B. Schemas (src/lib/models.ts)
1. User Schema
Purpose: Auth and Credit tracking.

TypeScript

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  image: String,
  // MVP Rate Limiting: Refills via cron or manual logic later
  credits: { type: Number, default: 3 }, 
  createdAt: { type: Date, default: Date.now },
});
2. Project Schema
Purpose: Stores the state of the idea and the "Interrogation" context.

TypeScript

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Project' },
  
  // 1. The User's initial raw input
  rawIdea: { type: String, required: true },
  
  // 2. The AI's clarifying questions and user's answers
  // Stored as an embedded array for fast retrieval
  context: [{
    questionId: String,
    questionText: String,
    userAnswer: String, // Null until answered
  }],

  // 3. State Machine
  status: { 
    type: String, 
    enum: ['DRAFT', 'ANALYZING', 'WAITING_INPUT', 'GENERATED'], 
    default: 'DRAFT' 
  },
  
  updatedAt: { type: Date, default: Date.now }
});
3. Artifact Schema
Purpose: Stores the generated PRDs. Index Strategy: Compound index on projectId + type for fast lookups.

TypeScript

const ArtifactSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, enum: ['FRONTEND', 'BACKEND'], required: true },
  content: { type: String, required: true }, // Markdown content
  version: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});
4. Server Actions (API Layer)
Location: src/features/project/actions.ts Security Rule: Every action must start with:

const session = await auth()

if (!session) throw new Error('Unauthorized')

Action 1: analyzeIdea(formData: FormData)
Trigger: User submits raw idea.

Logic:

Validate input with Zod (z.string().min(10)).

Check User Credits (user.credits > 0).

AI Call (The Critic): Send prompt to Claude 3.5 Sonnet.

Prompt: "Analyze this app idea. Identify 3 critical technical ambiguities. Return valid JSON only: { questions: [] }."

Create Project doc with status WAITING_INPUT.

Return projectId and questions.

Action 2: submitContext(projectId: string, answers: any[])
Trigger: User answers the questions.

Logic:

Update Project document: Save answers, set status to GENERATED.

Deduct 1 Credit from User.

AI Call (The Architect): Parallel execution (Promise.all).

Task A: Generate backend.md (Schema, API, Security).

Task B: Generate frontend.md (Components, State, UX).

Save result to Artifact collection.

Revalidate Next.js cache path.

Action 3: getDashboardData()
Trigger: /dashboard page load.

Logic: Fetch all Projects where userId == session.user.id. Sort by updatedAt: -1.

5. Zod Validation Schemas
Location: src/lib/validators.ts

TypeScript

import { z } from "zod";

export const IdeaInputSchema = z.object({
  rawIdea: z.string().min(10, "Describe your idea in at least 10 characters").max(2000),
});

export const ContextSubmissionSchema = z.object({
  projectId: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string().min(1, "Answer is required"),
  })),
});
6. AI System Prompts (System Instructions)
Location: src/lib/ai/prompts.ts

The Critic (Phase 1)
"You are a ruthless Senior Product Manager. The user has an idea. Your job is NOT to build it, but to find the holes. What tech stack details are missing? What auth strategy? What payment model? Ask 3 distinct, multiple-choice technical questions to clarify the MVP scope. Return strictly JSON."

The Backend Architect (Phase 2)
"You are a Senior Backend Engineer. Generate a technical backend.md file. Include: 1. Mongoose Schemas (TypeScript). 2. API Server Action signatures. 3. Security/RLS rules. Do NOT write frontend code. Use Next.js 15 / MongoDB conventions."

The Frontend Architect (Phase 2)
"You are a Senior Frontend Engineer. Generate a frontend.md file. Include: 1. Component Tree structure. 2. Shadcn/UI components needed. 3. Global State strategy (Zustand/Nuqs). Focus on UX flows and responsiveness."

7. Implementation Checklist
[ ] Set up MongoDB Atlas Cluster.

[ ] Configure .env (MONGODB_URI, AUTH_SECRET, ANTHROPIC_API_KEY).

[ ] Create lib/db.ts (Singleton).

[ ] Create Mongoose Models.

[ ] Implement analyzeIdea Server Action with Zod.

[ ] Implement submitContext Server Action with Zod.