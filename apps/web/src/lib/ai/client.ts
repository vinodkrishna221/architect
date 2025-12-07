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
}
