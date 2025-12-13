import { NextRequest } from "next/server";
import { auth } from "@/auth";
import dbConnect from "@/lib/db";
import { Conversation } from "@/lib/models";
import { streamGLM } from "@/lib/ai/client";
import {
    INTERROGATION_SYSTEM_PROMPT,
    buildInterrogationUserPrompt
} from "@/lib/ai/prompts/interrogation";
import { deductCredits, CREDIT_COSTS } from "@/lib/credits";

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

// Enable edge runtime for better streaming support (optional)
// export const runtime = "edge";

export const maxDuration = 60; // Allow up to 60 seconds for streaming

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication check FIRST
        const session = await auth();
        if (!session?.user?.id) {
            return new Response(
                formatSSE("error", { error: "Unauthorized" }),
                { status: 401, headers: sseHeaders() }
            );
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
                return new Response(
                    formatSSE("error", { error: "Conversation not found" }),
                    { status: 404, headers: sseHeaders() }
                );
            }

            // Deduct credits for user message (0.1 credits per message)
            if (userMessage) {
                const creditResult = await deductCredits(
                    session.user.email!,
                    CREDIT_COSTS.MESSAGE,
                    "interview_message"
                );

                if (!creditResult.success) {
                    return new Response(
                        formatSSE("error", {
                            error: "Insufficient credits",
                            message: creditResult.error,
                            remainingCredits: creditResult.remainingCredits
                        }),
                        { status: 402, headers: sseHeaders() }
                    );
                }

                // CRITICAL: Save user message IMMEDIATELY before AI call
                // This ensures the message persists even if user switches tabs
                conversation.messages.push({ role: "user", content: userMessage });
                await conversation.save();
            }
        } else {
            // New conversation - requires projectId and initialDescription
            if (!projectId || !initialDescription) {
                return new Response(
                    formatSSE("error", { error: "projectId and initialDescription are required" }),
                    { status: 400, headers: sseHeaders() }
                );
            }

            conversation = new Conversation({
                projectId,
                userId: session.user.id,
                initialDescription,
                messages: [],
                questionsAsked: 0,
            });
            await conversation.save();
        }

        // 3. Build prompt for AI
        const userPrompt = buildInterrogationUserPrompt(
            conversation.initialDescription,
            conversation.messages,
            conversation.questionsAsked
        );

        // 4. Create streaming response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Send start event with conversation metadata
                    controller.enqueue(
                        encoder.encode(formatSSE("start", {
                            conversationId: conversation._id.toString(),
                            questionsAsked: conversation.questionsAsked,
                        }))
                    );

                    let fullContent = "";

                    // Stream chunks from AI
                    for await (const chunk of streamGLM(INTERROGATION_SYSTEM_PROMPT, userPrompt)) {
                        fullContent += chunk;
                        controller.enqueue(
                            encoder.encode(formatSSE("chunk", { content: chunk }))
                        );
                    }

                    // Parse the complete response
                    let parsed: AIResponse;
                    try {
                        const cleaned = fullContent
                            .replace(/```json\n?/g, "")
                            .replace(/```\n?/g, "")
                            .trim();
                        parsed = JSON.parse(cleaned);
                    } catch {
                        // Fallback if parsing fails
                        console.warn("Failed to parse AI response, using fallback");
                        parsed = {
                            question: fullContent || "Could you tell me more about your project?",
                            category: "problem",
                            isComplete: false,
                            completionReason: null,
                        };
                    }

                    // Save AI response to database
                    conversation.messages.push({
                        role: "assistant",
                        content: parsed.question,
                        category: parsed.category,
                    });
                    conversation.questionsAsked += 1;

                    if (parsed.isComplete) {
                        conversation.status = "complete";
                        conversation.isReadyForBlueprints = true;
                    }

                    await conversation.save();

                    // Send completion event
                    controller.enqueue(
                        encoder.encode(formatSSE("done", {
                            question: parsed.question,
                            category: parsed.category,
                            isComplete: parsed.isComplete || false,
                            completionReason: parsed.completionReason || null,
                            questionsAsked: conversation.questionsAsked,
                        }))
                    );

                    controller.close();
                } catch (error) {
                    console.error("[Stream] Error during streaming:", error);
                    controller.enqueue(
                        encoder.encode(formatSSE("error", {
                            error: "AI service temporarily unavailable"
                        }))
                    );
                    controller.close();
                }
            },
        });

        return new Response(stream, { headers: sseHeaders() });
    } catch (error) {
        console.error("[API] Interrogation stream error:", error);
        return new Response(
            formatSSE("error", { error: "Failed to process request" }),
            { status: 500, headers: sseHeaders() }
        );
    }
}

// Text encoder for streaming
const encoder = new TextEncoder();

// Format data as Server-Sent Events
function formatSSE(event: string, data: Record<string, unknown>): string {
    return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// SSE response headers
function sseHeaders(): HeadersInit {
    return {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // Disable nginx buffering
    };
}
