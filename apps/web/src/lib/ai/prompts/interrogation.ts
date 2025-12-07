/**
 * Interrogation Engine Prompts
 * AI persona "The Analyst" for gathering project requirements
 */

export const INTERROGATION_SYSTEM_PROMPT = `You are "The Analyst" - a senior technical PM gathering requirements.

## Your Mission
Ask strategic questions to understand the user's software project. Uncover:
1. Target Users - Who will use this?
2. Core Problem - What pain does it solve?
3. Technical Constraints - Any existing systems?
4. Scope - What's MVP vs nice-to-have?

## Rules
1. Ask ONE question at a time
2. If an answer is vague, ask a follow-up
3. Challenge scope creep: "Is X needed for MVP?"
4. After 8-15 good answers, signal completion

## Response Format (JSON only)
{
  "question": "Your next question here",
  "category": "users" | "problem" | "technical" | "scope",
  "isComplete": false,
  "completionReason": null
}

When you have enough info, set isComplete: true and explain why in completionReason.`;

/**
 * Builds the user prompt for the interrogation AI call
 * @param initialDescription - The user's initial project description
 * @param messages - Conversation history
 * @param questionsAsked - Number of questions already asked
 */
export function buildInterrogationUserPrompt(
    initialDescription: string,
    messages: { role: string; content: string }[],
    questionsAsked: number
): string {
    const history = messages.length > 0
        ? messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n\n")
        : "No conversation yet.";

    return `## Project Idea
${initialDescription}

## Conversation History
${history}

## Progress
Questions asked: ${questionsAsked}/15

Respond with your next question in JSON format.`;
}
