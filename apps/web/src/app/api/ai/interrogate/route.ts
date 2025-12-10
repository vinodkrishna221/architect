import { NextResponse } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Conversation } from "@/lib/models";
import { callGLM } from "@/lib/ai/client";
import {
    INTERROGATION_SYSTEM_PROMPT,
    buildInterrogationUserPrompt
} from "@/lib/ai/prompts/interrogation";
import { deductCredits, CREDIT_COSTS, getCreditBalance } from "@/lib/credits";

interface InterrogationRequest {
    conversationId?: string;
    userMessage?: string;
    initialDescription?: string;
    projectId?: string;
}

interface AIResponse {
    question: string;
    category: "users" | "problem" | "technical" | "scope";
    isComplete: boolean;
    completionReason?: string | null;
}

export async function POST(req: Request) {
    try {
        // 1. Authentication check FIRST
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { conversationId, userMessage, initialDescription, projectId }: InterrogationRequest =
            await req.json();

        await dbConnect();

        let conversation;

        // 2. Start new conversation OR continue existing
        if (conversationId) {
            // Continue existing conversation - MUST validate ownership
            conversation = await Conversation.findOne({
                _id: conversationId,
                userId: session.user.id, // CRITICAL: Ownership validation
            });

            if (!conversation) {
                return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
            }

            // Deduct credits for user message (0.1 credits per message)
            if (userMessage) {
                const creditResult = await deductCredits(
                    session.user.email!,
                    CREDIT_COSTS.MESSAGE,
                    "interview_message"
                );

                if (!creditResult.success) {
                    return NextResponse.json(
                        {
                            error: "Insufficient credits",
                            message: creditResult.error,
                            remainingCredits: creditResult.remainingCredits
                        },
                        { status: 402 } // Payment Required
                    );
                }

                conversation.messages.push({ role: "user", content: userMessage });
            }
        } else {
            // New conversation - requires projectId and initialDescription
            if (!projectId || !initialDescription) {
                return NextResponse.json(
                    { error: "projectId and initialDescription are required for new conversations" },
                    { status: 400 }
                );
            }

            conversation = new Conversation({
                projectId,
                userId: session.user.id,
                initialDescription,
                messages: [],
                questionsAsked: 0,
            });
        }

        // 3. Build prompt and call AI
        const userPrompt = buildInterrogationUserPrompt(
            conversation.initialDescription,
            conversation.messages,
            conversation.questionsAsked
        );

        let aiResponse: string;
        try {
            aiResponse = await callGLM(INTERROGATION_SYSTEM_PROMPT, userPrompt);
        } catch (aiError) {
            console.error("AI call failed:", aiError);
            return NextResponse.json(
                { error: "AI service temporarily unavailable" },
                { status: 500 }
            );
        }

        // 4. Parse AI response (handle malformed JSON)
        let parsed: AIResponse;
        try {
            // Clean markdown code blocks if present
            const cleaned = aiResponse
                .replace(/```json\n?/g, "")
                .replace(/```\n?/g, "")
                .trim();
            parsed = JSON.parse(cleaned);
        } catch {
            // Fallback if parsing fails
            console.warn("Failed to parse AI response, using fallback question");
            parsed = {
                question: "Could you tell me more about your project?",
                category: "problem",
                isComplete: false,
                completionReason: null,
            };
        }

        // 5. Add AI question to conversation
        conversation.messages.push({
            role: "assistant",
            content: parsed.question,
            category: parsed.category,
        });
        conversation.questionsAsked += 1;

        // 6. Check for completion
        if (parsed.isComplete) {
            conversation.status = "complete";
            conversation.isReadyForBlueprints = true;
        }

        await conversation.save();

        // 7. Return response
        return NextResponse.json({
            conversationId: conversation._id,
            question: parsed.question,
            category: parsed.category,
            isComplete: parsed.isComplete || false,
            completionReason: parsed.completionReason || null,
            questionsAsked: conversation.questionsAsked,
        });
    } catch (error) {
        console.error("[API] Interrogation error:", error);
        return NextResponse.json(
            { error: "Failed to process request" },
            { status: 500 }
        );
    }
}
