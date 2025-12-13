import OpenAI from "openai";

const API_KEYS = [
    process.env.OPENROUTER_API_KEY_1,
    process.env.OPENROUTER_API_KEY_2,
    process.env.OPENROUTER_API_KEY_3,
].filter(Boolean) as string[];

let currentKeyIndex = 0;

function getNextApiKey(): string {
    if (API_KEYS.length === 0) {
        throw new Error("No OpenRouter API keys configured");
    }
    const key = API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
    return key;
}

export async function callGLM(
    systemPrompt: string,
    userPrompt: string
): Promise<string> {
    const maxRetries = API_KEYS.length;
    let lastError: Error | null = null;

    // Try each API key in rotation
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const client = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: getNextApiKey(),
            });

            const response = await client.chat.completions.create({
                model: "z-ai/glm-4.5-air:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 4096,
            });

            return response.choices[0]?.message?.content || "";
        } catch (error) {
            lastError = error as Error;
            console.warn(`[AI] Key ${attempt + 1}/${maxRetries} failed:`, (error as Error).message);

            // If rate limited, wait before trying next key
            if ((error as { status?: number }).status === 429) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            }
        }
    }

    // All keys failed
    throw new Error(`All ${maxRetries} API keys failed. Last error: ${lastError?.message}`);
}

/**
 * Streaming version of callGLM that yields content chunks as they arrive.
 * Use this for real-time UI updates like ChatGPT/Claude typing effect.
 * Includes retry logic with key rotation for rate limit handling.
 */
export async function* streamGLM(
    systemPrompt: string,
    userPrompt: string
): AsyncGenerator<string, void, unknown> {
    const maxRetries = API_KEYS.length;
    let lastError: Error | null = null;

    // Try each API key in rotation
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const client = new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: getNextApiKey(),
            });

            const stream = await client.chat.completions.create({
                model: "z-ai/glm-4.5-air:free",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 4096,
                stream: true,
            });

            // If we get here, the request succeeded - yield chunks
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }

            // Successfully completed, exit the retry loop
            return;
        } catch (error) {
            lastError = error as Error;
            const status = (error as { status?: number }).status;
            console.warn(`[AI Stream] Key ${attempt + 1}/${maxRetries} failed:`, (error as Error).message);

            // If rate limited (429), wait before trying next key
            if (status === 429) {
                console.log(`[AI Stream] Rate limited, trying next key after ${(attempt + 1) * 1000}ms delay...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
                // Continue to next key
            } else {
                // For non-rate-limit errors, throw immediately
                throw error;
            }
        }
    }

    // All keys exhausted
    throw new Error(`All ${maxRetries} API keys rate limited. Please try again later. Last error: ${lastError?.message}`);
}
