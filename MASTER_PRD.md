# Product Requirements Document: "The Architect" (Production-Grade)

## 1. App Overview
**Product Name:** The Architect (Internal Codename)

**Core Value Proposition:** A "Production-Grade Interrogation Engine" that prevents "vibe coding" (superficial implementations). It enforces a strict, curated development workflow: Deep-Dive Interrogation -> Scope Rationalization -> Comprehensive Specification -> Component-Driven Implementation.

**Target User:** Technical PMs, Founders, and Developers who need bulletproof, enterprise-ready blueprints before writing a single line of code.

## 2. Technical Architecture (The "Future-Proof" Stack)
We are building a Monolithic Full-Stack Application using Next.js.
*   **Framework:** Next.js 15 (App Router)
*   **Architecture:** Server-First (RSC for fetching, Server Actions for mutations).
*   **Database:** MongoDB Atlas (Singleton Pattern).
*   **Authentication:** NextAuth v5 (Auth.js) - Google & GitHub.
*   **Styling:** Tailwind CSS v4 + Shadcn/UI.
*   **Validation:** Zod (Strict runtime validation).
*   **Infrastructure:** Vercel (Edge Network).

## 3. The Agentic Workflow (Core Loop)

### Phase 1: Deep-Dive Interrogation (Agent A - The Analyst)
*   **Input:** User enters a raw, vague idea.
*   **Process:** Agent A initiates a **Deep-Dive Interrogation**.
    *   It asks **10 to 30 strategic questions** (not just 3-5) to uncover domain complexity, business logic, and edge cases.
*   **Scope Rationalization:**
    *   If Agent A detects "fluff" or unnecessary features, it explicitly challenges the user: *"Is [Feature X] required for MVP, or can this be deferred?"*
*   **Output:** A validated, scoped project definition.

### Phase 2: The Building Agent (Agent B - The Architect)
*   **Input:** Validated answers from Agent A.
*   **Process:** Generates a comprehensive suite of technical documents (PRDs).
*   **Deliverables (The "Blueprint Suite"):**
    1.  **Design System PRD:** Colors, typography, animations, component library standards.
    2.  **Frontend PRD:** Architecture, state management, routing.
    3.  **Backend PRD:** API design, services, middleware.
    4.  **Security PRD:** Auth flows, RBAC, data privacy.
    5.  **Database Architecture:** Schema design, ERD.
    6.  **MVP Feature List:** Strict v1.0 scope.

### Phase 3: The Prompt Generation Sequence (The Engineering Manager)
*   **Gatekeeper:** The system MUST ask: *"The architecture is defined. Shall I start writing the implementation prompts?"*
*   **Execution:** Upon approval, it generates prompts **one by one**, component by component (Component-Driven Development).
    *   It does NOT dump a monolithic prompt.
*   **Instruction:** Each prompt includes specific instructions for the user (e.g., *"Attach inspiration image for the Dashboard"*).

## 4. Functional Requirements
### A. Authentication & User Profile
*   **Login:** Simple sign-in page using NextAuth.
*   **Protection:** Middleware to protect `/dashboard` and `/project/*` routes.
*   **Rate Limiting:** Users are limited to creating 3 projects per day.

### B. The Workspace UI
*   **Left Panel:** Chat interface for the "Interrogation" (Q&A).
*   **Right Panel:** Live Markdown renderer showing the generated PRDs (Tabbed View).
*   **Action:** "Copy for Cursor" button (copies the markdown with a specific system prompt header).

## 5. Future Roadmap
*   **Direct GitHub Integration:** For automated code review, static analysis, and regression testing.