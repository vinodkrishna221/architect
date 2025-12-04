# Security Standards PRD: "The Architect"

## 1. Overview
This document defines the security protocols for "The Architect." As a tool that generates code, it must model best practices in its own implementation.

## 2. Authentication & Identity
*   **Provider:** NextAuth v5 (Auth.js).
*   **Strategy:** OAuth 2.0 (Google, GitHub).
*   **Session Management:** Database Strategy (MongoDBAdapter).
*   **Token Security:** HTTP-only cookies, CSRF protection (built-in to Next.js).

## 3. Authorization (RBAC)
*   **Model:** Resource-Based Access Control.
*   **Rule:** A user can ONLY access Projects where `project.userId === session.user.id`.
*   **Implementation:**
    *   **Middleware:** Protects `/dashboard` and `/project/:id`.
    *   **Server Actions:** Every action MUST validate `session.user.id` against the target resource.

## 4. Input Validation (The First Line of Defense)
*   **Library:** Zod.
*   **Strict Mode:** All API inputs (Server Actions) must be parsed with `z.strict()`.
*   **Sanitization:**
    *   **Project Inputs:** `rawIdea` is text-only. Strip HTML/Script tags to prevent Stored XSS.
    *   **Context Answers:** Validate against expected types (String/Enum).

## 5. API Security (Server Actions)
*   **Exposure:** Server Actions are public endpoints.
*   **Protection:**
    1.  **Authentication Check:** `if (!session) throw new UnauthorizedError()`.
    2.  **Rate Limiting:** Check User Credits before processing expensive AI calls.
    3.  **Data Minimization:** Return only what the UI needs.

## 6. AI Security & Safety
*   **Prompt Injection:**
    *   The "Interrogation" inputs are treated as untrusted user data.
    *   System Prompts must use delimiters (e.g., `"""User Input"""`) to separate instructions from data.
*   **Output Validation:**
    *   The AI output (PRDs) is Markdown. It must be rendered safely using `react-markdown` with sanitized plugins (no arbitrary HTML execution).

## 7. Data Privacy
*   **Data Isolation:** User data is logically isolated by `userId`.
*   **Encryption:** All data is encrypted at rest (MongoDB Atlas) and in transit (TLS 1.3).
