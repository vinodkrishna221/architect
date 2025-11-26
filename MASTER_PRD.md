Product Requirements Document: "The Architect" (MVP)
1. App Overview
Product Name: The Architect (Internal Codename)

Core Value Proposition: An "Interrogation Engine" that prevents AI coding failures. Instead of generating code immediately from vague ideas, it forces a "Critic" loop to identify gaps, asks the user clarifying questions, and then generates strictly decoupled Frontend and Backend technical specifications.

Target User: "Vibe Coders," Technical PMs, and Founders using AI coding agents (Cursor, Windsurf) who need bulletproof blueprints.

2. Technical Architecture (The "Future-Proof" Stack)
We are building a Monolithic Full-Stack Application using Next.js. There is NO separate backend server.

Framework: Next.js 15 (App Router)

Architecture: Server-First. Use React Server Components (RSC) for data fetching. Use Server Actions for mutations.

Bundler: Turbopack (next dev --turbo).

Database: MongoDB Atlas

Library: mongoose (for strict schema validation).

Pattern: Singleton Connection Pattern (to prevent serverless connection exhaustion).

Future-Proofing: Schemas must include placeholder fields for Vector Embeddings to support RAG later.

Authentication: NextAuth v5 (Auth.js)

Strategy: Google OAuth + GitHub OAuth.

Session: Database Strategy (MongoDBAdapter).

Styling & UI: Tailwind CSS v4 + Shadcn/UI

Icons: lucide-react.

Animation: framer-motion (for the "AI Thinking" states).

Validation (Crucial): Zod

Rule: Every Server Action must validate inputs with Zod before touching the DB.

Infrastructure: Vercel

CDN: Vercel Edge Network (Automatic).

Images: next/image for automatic optimization.

Social: Dynamic opengraph-image.tsx generation.

3. Functional Requirements (MVP)
A. Authentication & User Profile
Login: Simple sign-in page using NextAuth.

Protection: Middleware to protect /dashboard and /project/* routes.

Rate Limiting: Users are limited to creating 3 projects per day (Tracked in User Document).

B. The "Interrogation" Workflow (Core Loop)
Input: User enters a raw, vague idea (e.g., "I want an Uber for Dog Walkers").

The Critic (AI Agent A):

Analyzes input for technical gaps (Auth type? Payment gateway? Admin panel?).

Output: Does NOT generate the PRD yet. Generates a list of 3-5 multiple-choice questions.

The Form: UI displays these questions using framer-motion for smooth entry. User answers them.

The Architect (AI Agent B):

Takes Raw Idea + Answers.

Generates Two Distinct Artifacts.

C. The Split-Artifact Output
The system must generate two separate Markdown files in the UI (Tabbed View):

backend.md:

Database Schema (Mongoose/SQL definition).

API Routes (Server Actions definition).

Security Rules (RLS/Middleware).

frontend.md:

Component Tree.

State Management Strategy (Zustand vs Context).

UX Flows.

D. The Workspace UI
Left Panel: Chat interface for the "Interrogation" (Q&A).

Right Panel: Live Markdown renderer (using react-markdown) showing the generated PRDs.

Action: "Copy for Cursor" button (copies the markdown with a specific system prompt header).

4. Data Architecture (MongoDB Mongoose Schemas)
File: src/lib/models.ts

TypeScript

import mongoose, { Schema } from "mongoose";

// 1. USER SCHEMA
// Extends standard NextAuth fields with our specific needs
const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  image: String,
  credits: { type: Number, default: 3 }, // Simple rate limiting
  createdAt: { type: Date, default: Date.now },
});

// 2. PROJECT SCHEMA (The Core)
const ProjectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "Untitled Project" },
  rawIdea: { type: String, required: true },
  
  // State Machine for the Workflow
  status: { 
    type: String, 
    enum: ["DRAFT", "AWAITING_ANSWERS", "GENERATING", "COMPLETED"], 
    default: "DRAFT" 
  },
  
  // The "Context" gathered from Q&A
  answers: [{
    question: String,
    answer: String,
  }],

  // Future Proofing: Vector Embedding for Semantic Search
  // (We won't populate this in MVP, but the field exists)
  embedding: { type: [Number], select: false }, 
  
  createdAt: { type: Date, default: Date.now },
});

// 3. ARTIFACT SCHEMA (The Outputs)
// Stores the generated PRDs. We use the "Bucket Pattern" logic implicitly 
// by separating heavy text from the main Project document if needed later.
const ArtifactSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  type: { type: String, enum: ["FRONTEND", "BACKEND"], required: true },
  content: { type: String, required: true }, // The Markdown content
  version: { type: Number, default: 1 },
  updatedAt: { type: Date, default: Date.now },
});

// Singleton Model Export Helper
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Project = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export const Artifact = mongoose.models.Artifact || mongoose.model("Artifact", ArtifactSchema);
5. API Strategy (Server Actions)
We use Next.js Server Actions exclusively. No pages/api.

File: src/features/project/actions.ts

analyzeIdea(formData: FormData)

Input: Raw text.

Process: Calls AI to generate clarifying questions.

Output: Returns JSON array of questions. Does NOT save to DB yet.

submitProjectContext(data: z.infer<typeof ContextSchema>)

Input: Original Idea + Answers to questions.

Process: Creates Project in MongoDB. Decrements user credits.

Trigger: Initiates the generateArtifacts streaming process.

generateArtifacts(projectId: string)

Process: Parallel AI calls (one for Frontend spec, one for Backend spec).

Output: Streams text to the UI using ai/rsc (Vercel AI SDK) and saves final result to Artifact collection.

6. Folder Structure (Feature-Based)
This structure is designed for scalability. We group by Feature, not by file type.

Plaintext

/src
  /app                    # Next.js App Router (Routes only, minimal logic)
    /(auth)               # Login/Signup layout group
    /(dashboard)          # Dashboard layout group
      /dashboard/page.tsx
    /project
      /[id]/page.tsx      # Main Workspace
    /api/auth/[...nextauth]/route.ts
    /layout.tsx           # Root Layout (includes Toaster, Providers)
    /globals.css
  
  /components             # Shared UI (Shadcn)
    /ui                   # Button, Input, Card, Dialog
    /theme-provider.tsx
  
  /features               # BUSINESS LOGIC HERE
    /auth
      /components/login-form.tsx
    /project
      /actions.ts         # Server Actions (Zod validated)
      /components
        /chat-interface.tsx
        /artifact-viewer.tsx
      /schemas.ts         # Zod definitions
      /hooks              # React Query hooks (if needed for polling)
  
  /lib
    /db.ts                # Singleton MongoDB Connection
    /ai.ts                # OpenAI/Anthropic Config
    /utils.ts             # CN helper
  
  /types                  # Global TS Interfaces
7. AI System Prompts (The Secret Sauce)
When the app generates the artifacts, it must use these specific personas:

Backend Agent Prompt: "You are a Senior Backend Architect. Your goal is to write a backend.md spec. You care about Data Integrity, Security, and Scalability. You DO NOT care about CSS or colors. Define Mongoose schemas, API Server Action signatures, and Zod validation schemas."

Frontend Agent Prompt: "You are a Senior Frontend Engineer. Your goal is to write a frontend.md spec. You care about Component hierarchy, State Management (Zustand/Context), and UX flows. You assume the backend API already exists as defined in the partner spec."