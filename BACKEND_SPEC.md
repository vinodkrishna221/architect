# Backend Technical Spec: "The Architect" Core

## 1. Overview
This document defines the server-side architecture, database schemas, and business logic for "The Architect." The system runs entirely within the Next.js 15 App Router environment using Server Actions.

## 2. Tech Stack (Backend Strict)
*   **Runtime:** Node.js (Next.js Server Actions).
*   **Database:** MongoDB Atlas (Multi-cloud).
*   **ORM:** Mongoose (Strict Schema Validation).
*   **Validation:** Zod (Runtime data validation).
*   **Auth:** NextAuth v5 (Auth.js).
*   **AI Engine:** Vercel AI SDK (ai package) + Anthropic Claude 3.5 Sonnet.

## 3. Database Architecture (Mongoose)
*See `DATABASE_ARCHITECTURE.md` for full schema definitions.*

### Key Schema Updates for Agentic Workflow
*   **Project Schema:** Must support a large `context` array for the **10-30 question** interrogation.
*   **Artifact Schema:** Must support new types: `DESIGN`, `FRONTEND`, `BACKEND`, `SECURITY`, `DATABASE`, `MVP`.

## 4. Server Actions (API Layer)
**Location:** `src/features/project/actions.ts`

### Action 1: `analyzeIdea(formData: FormData)`
*   **Trigger:** User submits raw idea.
*   **Logic:**
    1.  Validate input with Zod.
    2.  **AI Call (The Analyst):** "Analyze this idea. Ask **10-30** strategic questions to uncover domain complexity. Identify 'fluff' features for Scope Rationalization."
    3.  Create Project doc with status `WAITING_INPUT`.
    4.  Return projectId and questions.

### Action 2: `submitContext(projectId: string, answers: any[])`
*   **Trigger:** User answers the deep-dive questions.
*   **Logic:**
    1.  Update Project document with answers.
    2.  **AI Call (The Architect):** Parallel execution to generate the **Blueprint Suite**.
        *   Task A: Design System PRD
        *   Task B: Frontend PRD
        *   Task C: Backend PRD
        *   Task D: Security PRD
        *   Task E: Database Architecture
        *   Task F: MVP Feature List
    3.  Save results to Artifact collection.

### Action 3: `generatePrompts(projectId: string)`
*   **Trigger:** User approves the "Gatekeeper" modal.
*   **Logic:**
    1.  Reads all generated PRDs.
    2.  **AI Call (The Engineering Manager):** "Generate implementation prompts **one by one**, component by component. Do not dump."
    3.  Stream the prompts to the client.

## 5. AI System Prompts (System Instructions)
**Location:** `src/lib/ai/prompts.ts`

### The Analyst (Phase 1)
"You are a Senior Requirements Analyst. The user has an idea. Your job is to conduct a **Deep-Dive Interrogation**. Ask **10-30** strategic questions. Challenge 'fluff' features. Return JSON."

### The Architect (Phase 2)
"You are a Senior Principal Architect. Generate the requested PRD (Design/Frontend/Backend/Security/DB). Be exhaustive, professional, and authoritative."

### The Engineering Manager (Phase 3)
"You are a Lead Engineer. Convert these PRDs into a series of **Implementation Prompts**. Output them one by one. Include specific instructions for the user (e.g., 'Attach inspiration')."