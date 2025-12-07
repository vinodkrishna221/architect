/**
 * Blueprint Generation Prompts
 * AI persona "The Architect" for generating PRD documents
 */

export const BLUEPRINT_TYPES = [
  "design-system",
  "frontend",
  "backend",
  "database",
  "security",
  "mvp-features",
] as const;

export type BlueprintType = (typeof BLUEPRINT_TYPES)[number];

export const BLUEPRINT_SYSTEM_PROMPT = `You are "The Architect" - a senior technical writer creating production-grade documents.

## Style
- Crystal clear and actionable
- No fluff or placeholder content
- Technical but accessible
- Include code examples where helpful

## Output Format
Write in Markdown directly. Start with a # heading. Do NOT wrap in JSON or code blocks.
No explanations before or after the document - just the document itself.`;

export const BLUEPRINT_CONFIGS: Record<BlueprintType, { title: string; prompt: string }> = {
  "design-system": {
    title: "Design System PRD",
    prompt: `Generate a Design System PRD with:
- Color palette (primary, secondary, semantic colors) with hex codes
- Typography scale (headings h1-h6, body text, captions)
- Spacing system (4px/8px grid)
- Component standards (buttons, inputs, cards, modals)
- Accessibility requirements (WCAG 2.1 AA compliance)`,
  },
  "frontend": {
    title: "Frontend Architecture PRD",
    prompt: `Generate a Frontend Architecture PRD with:
- Component hierarchy and folder structure
- State management approach (local vs global state)
- Routing structure with page components
- Data fetching patterns (client vs server)
- Performance considerations (lazy loading, code splitting)`,
  },
  "backend": {
    title: "Backend Architecture PRD",
    prompt: `Generate a Backend Architecture PRD with:
- API endpoints table (method, path, description, auth required)
- Request/response examples for key endpoints
- Authentication and authorization approach
- Error handling strategy with error codes
- Rate limiting and validation rules`,
  },
  "database": {
    title: "Database Architecture",
    prompt: `Generate a Database Architecture document with:
- Entity descriptions and relationships
- Schema definitions (TypeScript/Mongoose format preferred)
- Relationships between entities (one-to-many, many-to-many)
- Index recommendations for common queries
- Data validation rules`,
  },
  "security": {
    title: "Security PRD",
    prompt: `Generate a Security PRD with:
- Authentication flow (signup, login, logout, password reset)
- Authorization rules (role-based access control)
- Data protection measures (encryption, PII handling)
- Input validation and sanitization rules
- Security headers and HTTPS requirements`,
  },
  "mvp-features": {
    title: "MVP Feature List",
    prompt: `Generate an MVP Feature List with:
- Numbered features (maximum 12 for MVP)
- Each feature with: Title, User Story ("As a... I want... So that..."), Acceptance Criteria
- Priority labels (P0 = must have, P1 = should have, P2 = nice to have)
- Estimated complexity (Small/Medium/Large)
- OUT OF SCOPE section listing features NOT in MVP`,
  },
};

/**
 * Builds the complete prompt for generating a specific blueprint type
 * @param type - The blueprint type to generate
 * @param conversationSummary - Summary of the interrogation conversation
 */
export function buildBlueprintPrompt(
  type: BlueprintType,
  conversationSummary: string
): string {
  const config = BLUEPRINT_CONFIGS[type];
  
  return `${config.prompt}

## Project Requirements (from interview)
${conversationSummary}

Generate the ${config.title} now. Output markdown directly.`;
}
