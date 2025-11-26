Frontend Technical Spec: "The Architect" UI
1. Overview
This document defines the user interface and client-side logic for "The Architect," a SaaS platform that helps users generate technical PRDs. The UI must be Server-First (using React Server Components by default) but highly interactive in specific "Workspace" areas using Client Components.

2. Tech Stack (Frontend Strict)
Framework: Next.js 15 (App Router).

Styling: Tailwind CSS v4 (Mobile-first).

Component Library: Shadcn/UI (Radix Primitives).

Icons: Lucide React.

Animation: Framer Motion (Crucial for the "AI Thinking" and "Question Form" transitions).

Markdown Rendering: react-markdown with rehype-highlight (for the PRD output).

Font: Geist Sans (Next.js default) or Inter.

State Management: nuqs (URL state management) for tabs/filters, React Context for global session.

3. Design System & Theme
Vibe: "Linear-style," dark mode default, clean borders, subtle gradients.

Color Palette: Slate/Zinc (Neutral), Indigo (Primary/Action), Red (Error/Destructive).

Responsive Strategy:

Desktop: Split view (Chat Left | Artifact Right).

Mobile: Tabbed view (Toggle between Chat and Artifact).

4. Core Page Specifications
A. Landing / Auth Page (/page.tsx)
Type: Server Component.

Layout: Centered Card layout.

Components:

HeroSection: Title "The Architect" + Subtitle "Build blueprints, not hallucinations."

AuthButtons: "Sign in with GitHub" / "Sign in with Google" (calls NextAuth).

UX: If session exists, auto-redirect to /dashboard.

B. Dashboard (/dashboard/page.tsx)
Type: Server Component (RSC).

Data Fetching: Fetches user's Project list directly from DB (no API route).

Components:

ProjectGrid: Responsive grid of ProjectCard components.

CreateButton: Triggers a modal or navigates to /project/new.

ProjectCard: Shows Title, Status Badge (Draft/Completed), and Date.

CreditsDisplay: Shows "X/3 Daily Credits Used" (Top right).

C. The Workspace (/project/[id]/page.tsx)
Type: Client Component Wrapper (surrounding server data).

Layout: ResizablePanel (Shadcn) - 40% Chat / 60% Artifact.

Core Feature: The "Interrogation" Flow.

Component 1: ChatInterface.tsx (Left Panel)
State: Stores list of messages (User + AI).

Animation:

When AI is "Analyzing," show a pulsing Skeleton loader.

When AI asks clarifying questions, use AnimatePresence (Framer Motion) to slide the question form in smoothly.

Sub-Component: QuestionForm.tsx

Renders dynamic questions from the backend (e.g., "What auth provider?").

Input: Radio groups or Text inputs.

Action: onSubmit triggers the submitProjectContext Server Action.

Component 2: ArtifactViewer.tsx (Right Panel)
Tabs: Two tabs: Backend Spec | Frontend Spec.

Renderer: react-markdown component.

Features:

Streaming: Must handle streaming text chunks gracefully (no flickering).

Copy Button: Floating button top-right: "Copy for Cursor" (copies markdown to clipboard).

Download: "Download .md" button.

5. Required Shadcn Components
Install these specific components to build the UI faster:

Bash

npx shadcn@latest add button card input textarea dialog sheet \
  badge skeleton toast tabs separator scroll-area \
  resizable radio-group form label
6. Component Hierarchy (File Structure)
Plaintext

/src
  /components
    /ui                   # Installed Shadcn components
    /layout
      /sidebar.tsx        # Navigation sidebar (Desktop)
      /mobile-nav.tsx     # Hamburger menu (Mobile)
    /workspace
      /chat-interface.tsx      # The main chat container
      /message-bubble.tsx      # Individual chat bubbles
      /question-form.tsx       # The "Interrogation" dynamic form
      /artifact-viewer.tsx     # The Markdown renderer
      /copy-button.tsx         # "Copy to Clipboard" logic
    /dashboard
      /project-card.tsx
      /create-project-dialog.tsx
7. Client-Side State Logic (Hooks)
Hook: useArtifactStream(projectId)

Purpose: Handles the Server Sent Events (SSE) or useChat stream from Vercel AI SDK.

Logic:

Connects to stream.

Parses incoming tokens.

Splits content into frontend_content and backend_content based on markdown headers or delimiters.

Updates the ArtifactViewer in real-time.

8. Implementation Steps for Agent
Setup UI Libs: Install Shadcn, Framer Motion, and Lucide.

Build Shell: Create the DashboardLayout and WorkspaceLayout.

Build Atoms: Create ProjectCard and MessageBubble.

Build Complex: Implement QuestionForm with framer-motion exit/enter animations.

Integrate: Connect ChatInterface to the Server Actions defined in BACKEND_SPEC.md.