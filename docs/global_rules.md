# Global Agent Rules

These rules apply to all interactions and code generation. They are designed to be robust yet flexible, avoiding common pitfalls like rigidity or context overload.

## 🧠 Behavior & Interaction

1.  **Context First (Smart Loading)**: Before editing, I must understand the file's purpose.
    *   *Refinement*: For large files or deep dependency chains, I will start by reading signatures/exports. I will only read full implementations if necessary for the specific edit or if debugging.
2.  **Ask on Ambiguity**: If a requirement is vague, I must ask for clarification.
    *   *Refinement*: I will propose a likely interpretation ("Did you mean X?") to speed up the process, rather than just asking "What do you mean?".
3.  **Plan Complex Tasks**: I must draft an `implementation_plan.md` for tasks involving >2 files or complex logic.
    *   *Refinement*: **Exemption**: Simple edits (typos, comments, logs, formatting, single-line fixes) do *not* require a formal plan.
4.  **Security Non-Negotiable**: I will **never** output secrets in plain text.
    *   *Refinement*: I will distinguish between actual secrets (private keys, passwords) and public identifiers (publishable keys, public IDs).
5.  **Destructive Action Confirmation**: I must ask for approval before deleting files.
    *   *Refinement*: **Exemption**: I can delete empty files, generated artifacts (e.g., in `dist/` or `.next/`), or temporary files I created without asking.

## 🛡️ Code Quality & Standards

6.  **Strict TypeScript**: I will avoid `any`.
    *   *Refinement*: **Escape Hatch**: If a third-party library has broken types, I may use `any` but must add a comment: `// @ts-expect-any: [Reason]`.
7.  **Functional Paradigm**: Use Functional Components and Hooks.
    *   *Refinement*: **Exemption**: Error Boundaries (which require Class components) are allowed.
8.  **DRY (Don't Repeat Yourself)**: Extract repeated logic.
    *   *Refinement*: Extract only if repeated **3+ times** OR if the logic is complex (>5 lines) and domain-specific. I will not prematurely abstract simple primitives.
9.  **Single Responsibility**: Split large files.
    *   *Refinement*: I will suggest splitting only when a file exceeds 300 lines *and* clearly contains multiple distinct components or hooks.
10. **Descriptive Naming**: Variables and functions must be self-documenting.
11. **Comment Intent**: Comments should explain **why** a complex piece of code exists, not **what** it does.
12. **Modern Syntax**: Prefer modern ES features (destructuring, spread, async/await).

## ✅ Reliability & Verification

13. **Input Validation**: Validate external inputs (API responses, form data) using schemas (e.g., Zod).
14. **Error Handling**: Wrap risky operations in `try/catch` and handle errors gracefully (UI feedback).
15. **Self-Correction**: If a tool call fails, I will analyze the error message and adjust my approach. I will not blindly retry.
16. **Verify Changes**: Verify code works before completing the task.
    *   *Refinement*: **Tiered Verification**:
        1.  **Always**: Syntax/Linter check.
        2.  **If possible**: Run existing unit tests for the modified code.
        3.  **Manual**: If automated verification is too slow (>30s) or complex, I will provide specific manual verification steps for the user.
17. **Clean Up**: Remove unused imports, temporary `console.log` statements, and dead code.

## 🏗️ Architecture & Performance

18. **Colocation**: Keep related files (styles, tests, types) close to the feature they belong to.
19. **Accessibility (a11y)**: Use semantic HTML and ensure interactive elements have labels.
20. **Performance Awareness**: Avoid defining stable objects/functions inside render loops unless memoized.
