/**
 * Implementation Prompts - Phase 3
 * "Engineering Manager" agent that generates component-by-component prompts
 * for AI coding assistants (Cursor, Copilot, Claude)
 */

import type { PromptCategory } from "@/lib/types";
import type { Blueprint } from "@/lib/types";

// Ordered prompt categories - must be generated in this sequence
export const PROMPT_CATEGORIES: PromptCategory[] = [
    "setup",
    "database",
    "auth",
    "api",
    "shared-components",
    "features",
    "pages",
    "testing",
];

// Category metadata
export const CATEGORY_INFO: Record<PromptCategory, { title: string; description: string; estimatedTime: string }> = {
    "setup": {
        title: "Environment Setup",
        description: ".env.example, package.json dependencies, folder structure",
        estimatedTime: "15-30 mins",
    },
    "database": {
        title: "Database Layer",
        description: "Schema definitions, migrations, seed data",
        estimatedTime: "30-45 mins",
    },
    "auth": {
        title: "Authentication",
        description: "Auth provider config, middleware, protected routes",
        estimatedTime: "30-60 mins",
    },
    "api": {
        title: "Core API Routes",
        description: "API endpoint implementation",
        estimatedTime: "45-90 mins",
    },
    "shared-components": {
        title: "Shared Components",
        description: "Design system components (Button, Input, Card, Modal)",
        estimatedTime: "60-90 mins",
    },
    "features": {
        title: "Feature Components",
        description: "Core feature implementations from MVP list",
        estimatedTime: "60-120 mins",
    },
    "pages": {
        title: "Pages/Routes",
        description: "Page components with layout integration",
        estimatedTime: "45-90 mins",
    },
    "testing": {
        title: "Testing Suite",
        description: "Unit tests, integration tests, E2E setup",
        estimatedTime: "60-90 mins",
    },
};

// The Engineering Manager persona
export const ENGINEERING_MANAGER_SYSTEM_PROMPT = `You are "The Engineering Manager" - a senior technical lead creating precise implementation prompts for AI coding assistants (Cursor, Copilot, Claude).

## Your Role
- Generate clear, actionable prompts that a developer can paste into an AI assistant
- Each prompt should result in working, production-ready code
- Reference specific files and patterns from the architecture blueprints
- Include acceptance criteria to verify implementation

## Output Format
Generate prompts in this exact markdown structure:

## 🎯 Component: [Name]

### Prerequisites
- Completed: [List previous prompts that must be done first]
- Required files: [Files that should exist before starting]

### User Action Required
- [ ] [Any manual steps the user needs to take before running this prompt]

### Implementation Prompt
\`\`\`
[The actual prompt optimized for AI coding assistants - detailed, specific, actionable]
\`\`\`

### Acceptance Criteria
- [ ] [Specific testable criteria]

### Next Step
After completing this, proceed to: [Next prompt name]

## Guidelines
- Be specific about file paths, function names, and imports
- Include code examples where it helps clarify intent
- Reference the project's tech stack and patterns
- Keep prompts focused - one logical unit of work per prompt
- DON'T include placeholder content - make prompts actionable`;

// Template prompts for each category
export const CATEGORY_TEMPLATES: Record<PromptCategory, string> = {
    "setup": `Generate an Environment Setup prompt that includes:
- .env.example file with all required environment variables (with placeholder values)
- package.json dependencies based on the tech stack
- Folder structure creation (src/components, src/lib, src/app, etc.)
- TypeScript config adjustments if needed
- Initial configuration files (tailwind.config, next.config, etc.)`,

    "database": `Generate a Database Layer prompt that includes:
- Mongoose/Prisma schema definitions based on the Database Architecture PRD
- Connection utility with singleton pattern
- Type definitions for all entities
- Seed data script for development
- Any required migrations or indexes`,

    "auth": `Generate an Authentication prompt that includes:
- NextAuth/Auth.js configuration based on Security PRD
- Provider setup (Google, GitHub, or as specified)
- Session management and user schema integration
- Middleware for protected routes
- Auth utility functions (getCurrentUser, requireAuth, etc.)`,

    "api": `Generate API Routes prompts (one per major endpoint group) that include:
- Route handler with proper HTTP methods
- Request validation using Zod
- Database operations
- Error handling with appropriate status codes
- Type-safe response format
Reference the Backend Architecture PRD for endpoint specifications.`,

    "shared-components": `Generate Shared Components prompts based on Design System PRD:
- Button component with variants (primary, secondary, ghost, destructive)
- Input component with validation states
- Card component with header/body/footer
- Modal/Dialog component with proper accessibility
- Toast/notification component
Use the color palette and typography from the design system.`,

    "features": `Generate Feature Component prompts (one per core MVP feature):
- Component structure and state management
- Integration with API routes
- User interactions and feedback
- Loading and error states
- Responsive design considerations
Reference the MVP Feature List for specific requirements.`,

    "pages": `Generate Page/Route prompts that include:
- Page component with layouts
- Data fetching (Server Components or useQuery)
- SEO metadata
- Navigation integration
- Loading and error boundaries
Reference the Frontend Architecture PRD for routing structure.`,

    "testing": `Generate Testing Suite prompts that include:
- Jest/Vitest configuration
- Unit test examples for utilities
- Component testing with React Testing Library
- API route testing
- E2E test setup with Playwright/Cypress
- Test utilities and mocks`,
};

/**
 * Build the prompt for generating implementation prompts for a category
 */
export function buildImplementationPromptRequest(
    category: PromptCategory,
    blueprints: Blueprint[],
    projectTitle: string,
    techStack: string,
    previousPromptTitles: string[]
): string {
    const categoryInfo = CATEGORY_INFO[category];
    const template = CATEGORY_TEMPLATES[category];

    // Extract relevant blueprints for this category
    const relevantBlueprints = getRelevantBlueprints(category, blueprints);
    const blueprintContext = relevantBlueprints
        .map(b => `### ${b.title}\n${b.content.slice(0, 2000)}...`) // Truncate long content
        .join("\n\n");

    return `Generate implementation prompts for: ${categoryInfo.title}

## Project Context
- Project: ${projectTitle}
- Tech Stack: ${techStack}
- Category: ${category} (${categoryInfo.description})
- Estimated Time: ${categoryInfo.estimatedTime}

## Previously Generated Prompts
${previousPromptTitles.length > 0 ? previousPromptTitles.map(t => `- ${t}`).join("\n") : "None (this is the first category)"}

## Requirements
${template}

## Reference Blueprints
${blueprintContext || "No specific blueprints available - use general best practices."}

Generate 1-3 focused prompts for this category. Each prompt should be a single, actionable unit of work.
Output only the prompts in the specified markdown format.`;
}

/**
 * Get blueprints relevant to a specific category
 */
function getRelevantBlueprints(category: PromptCategory, blueprints: Blueprint[]): Blueprint[] {
    const relevanceMap: Record<PromptCategory, string[]> = {
        "setup": ["frontend", "backend", "design-system"],
        "database": ["database", "backend"],
        "auth": ["security", "backend"],
        "api": ["backend", "mvp-features"],
        "shared-components": ["design-system", "frontend"],
        "features": ["mvp-features", "frontend", "backend"],
        "pages": ["frontend", "design-system", "mvp-features"],
        "testing": ["backend", "frontend", "security"],
    };

    const relevantTypes = relevanceMap[category] || [];
    return blueprints.filter(b => relevantTypes.includes(b.type));
}

/**
 * Build system context to prepend when copying a prompt for Cursor/Claude
 */
export function buildCopyContext(
    projectTitle: string,
    techStack: string,
    category: PromptCategory,
    promptTitle: string,
    relevantFiles: string[]
): string {
    return `## System Context
Project: ${projectTitle}
Tech Stack: ${techStack}
Current Phase: ${CATEGORY_INFO[category].title} - ${promptTitle}

Review these files before proceeding:
${relevantFiles.map(f => `- ${f}`).join("\n")}

---

`;
}

/**
 * Parse AI response to extract individual prompts
 */
export function parsePromptResponse(response: string): {
    title: string;
    content: string;
    prerequisites: string[];
    userActions: string[];
    acceptanceCriteria: string[];
    nextStep: string;
}[] {
    const prompts: ReturnType<typeof parsePromptResponse> = [];

    // Split by ## 🎯 Component: headers
    const sections = response.split(/##\s*🎯\s*Component:\s*/i);

    for (const section of sections.slice(1)) { // Skip first empty section
        const lines = section.trim().split("\n");
        const title = lines[0]?.trim() || "Untitled Prompt";

        // Extract sections using regex
        const prerequisitesMatch = section.match(/### Prerequisites([\s\S]*?)(?=###|$)/i);
        const userActionsMatch = section.match(/### User Action Required([\s\S]*?)(?=###|$)/i);
        const implementationMatch = section.match(/### Implementation Prompt([\s\S]*?)(?=###|$)/i);
        const criteriaMatch = section.match(/### Acceptance Criteria([\s\S]*?)(?=###|$)/i);
        const nextStepMatch = section.match(/### Next Step([\s\S]*?)(?=###|$)/i);

        const extractListItems = (text: string | undefined): string[] => {
            if (!text) return [];
            const items = text.match(/[-*]\s*(?:\[.\])?\s*(.+)/g) || [];
            return items.map(item => item.replace(/^[-*]\s*(?:\[.\])?\s*/, "").trim());
        };

        prompts.push({
            title,
            content: implementationMatch?.[1]?.trim() || section,
            prerequisites: extractListItems(prerequisitesMatch?.[1]),
            userActions: extractListItems(userActionsMatch?.[1]),
            acceptanceCriteria: extractListItems(criteriaMatch?.[1]),
            nextStep: nextStepMatch?.[1]?.trim().replace(/^After completing this, proceed to:\s*/i, "") || "",
        });
    }

    return prompts;
}

/**
 * Get user actions for a specific category
 */
export function getDefaultUserActions(category: PromptCategory): string[] {
    const actionsMap: Record<PromptCategory, string[]> = {
        "setup": [
            "Confirm project directory is initialized",
            "Review tech stack requirements",
        ],
        "database": [
            "Ensure database connection string is configured in .env",
            "Review database schema from blueprints",
        ],
        "auth": [
            "Configure OAuth provider credentials in .env",
            "Review authentication flow from Security PRD",
        ],
        "api": [
            "Review API endpoints from Backend PRD",
            "Confirm database models are in place",
        ],
        "shared-components": [
            "Attach inspiration images for UI components (optional)",
            "Review Design System PRD for styling guidelines",
        ],
        "features": [
            "Attach feature inspiration images (optional)",
            "Review MVP Feature List for acceptance criteria",
        ],
        "pages": [
            "Confirm routing structure from Frontend PRD",
            "Ensure shared components are implemented",
        ],
        "testing": [
            "Review all implemented features",
            "Ensure test environment is configured",
        ],
    };

    return actionsMap[category] || [];
}
