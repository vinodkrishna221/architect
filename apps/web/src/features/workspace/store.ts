"use client";

import { create } from "zustand";
import { Message, Blueprint, MessageCategory } from "@/lib/types";

// Re-export for backward compatibility
export type { Message, Blueprint };

// Interrogation state
interface InterrogationState {
    conversationId: string | null;
    messages: Message[];
    isComplete: boolean;
    isLoading: boolean;
    questionsAsked: number;
    // Streaming state
    streamingMessageId: string | null;
    isStreaming: boolean;
}

// Blueprint state
interface BlueprintState {
    suiteId: string | null;
    blueprints: Blueprint[];
    activeBlueprint: string | null;
    isGenerating: boolean;
    generationProgress: { completed: number; total: number };
    activeTab: "blueprints" | "prompts";
}

// Combined workspace state
interface WorkspaceState extends InterrogationState, BlueprintState {
    // Interrogation actions
    setConversationId: (id: string) => void;
    addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
    setComplete: (complete: boolean) => void;
    setLoading: (loading: boolean) => void;
    setQuestionsAsked: (count: number) => void;
    // Streaming actions
    startStreamingMessage: (category?: MessageCategory) => string;
    updateStreamingMessage: (content: string) => void;
    finalizeStreamingMessage: (category?: MessageCategory, content?: string) => void;

    // Blueprint actions
    setSuiteId: (id: string) => void;
    setBlueprints: (blueprints: Blueprint[]) => void;
    updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
    setActiveBlueprint: (type: string) => void;
    setGenerating: (generating: boolean) => void;
    setGenerationProgress: (completed: number, total: number) => void;

    // Utility actions
    reset: () => void;

    // Load existing conversation from API response
    loadConversation: (data: {
        conversationId: string;
        messages: Array<{ id: string; role: "user" | "assistant"; content: string; category?: MessageCategory }>;
        questionsAsked: number;
        isComplete: boolean;
        suiteId?: string | null;
        blueprints?: Blueprint[];
    }) => void;

    setActiveTab: (tab: "blueprints" | "prompts") => void;
}

const initialState: InterrogationState & BlueprintState = {
    conversationId: null,
    messages: [],
    isComplete: false,
    isLoading: false,
    questionsAsked: 0,
    streamingMessageId: null,
    isStreaming: false,

    // Blueprints
    suiteId: null,
    blueprints: [],
    activeBlueprint: null,
    isGenerating: false,
    generationProgress: { completed: 0, total: 0 }, // Total comes dynamically from API based on project type
    activeTab: "blueprints",
};

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
    ...initialState,

    // Interrogation actions
    setConversationId: (id) => set({ conversationId: id }),

    addMessage: (message) =>
        set((state) => ({
            messages: [
                ...state.messages,
                {
                    ...message,
                    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                    timestamp: new Date(),
                },
            ],
        })),

    setComplete: (complete) => set({ isComplete: complete }),

    setLoading: (loading) => set({ isLoading: loading }),

    setQuestionsAsked: (count) => set({ questionsAsked: count }),

    // Streaming actions
    startStreamingMessage: (category) => {
        const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        set((state) => ({
            streamingMessageId: id,
            isStreaming: true,
            messages: [
                ...state.messages,
                {
                    id,
                    role: "assistant" as const,
                    content: "",
                    category,
                    timestamp: new Date(),
                },
            ],
        }));
        return id;
    },

    updateStreamingMessage: (content) =>
        set((state) => {
            if (!state.streamingMessageId) return state;
            return {
                messages: state.messages.map((msg) =>
                    msg.id === state.streamingMessageId
                        ? { ...msg, content: msg.content + content }
                        : msg
                ),
            };
        }),

    finalizeStreamingMessage: (category, content) =>
        set((state) => {
            if (!state.streamingMessageId) return state;
            return {
                streamingMessageId: null,
                isStreaming: false,
                messages: state.messages.map((msg) =>
                    msg.id === state.streamingMessageId
                        ? {
                            ...msg,
                            category: category || msg.category,
                            // Replace raw JSON with parsed question if content is provided
                            ...(content !== undefined && { content })
                        }
                        : msg
                ),
            };
        }),

    // Blueprint actions
    setSuiteId: (id) => set({ suiteId: id }),

    setBlueprints: (blueprints) =>
        set((state) => ({
            blueprints,
            activeBlueprint: state.activeBlueprint || blueprints[0]?.type || null,
        })),

    updateBlueprint: (id, updates) =>
        set((state) => ({
            blueprints: state.blueprints.map((bp) =>
                bp.id === id ? { ...bp, ...updates } : bp
            ),
        })),

    setActiveBlueprint: (type) => set({ activeBlueprint: type }),

    setGenerating: (generating) => set({ isGenerating: generating }),

    setGenerationProgress: (completed, total) =>
        set({ generationProgress: { completed, total } }),

    // Reset to initial state
    reset: () => set(initialState),

    // Load existing conversation from API (for returning users)
    loadConversation: (data) =>
        set((state) => ({
            conversationId: data.conversationId,
            messages: data.messages.map((msg) => ({
                ...msg,
                timestamp: new Date(),
            })),
            questionsAsked: data.questionsAsked,
            isComplete: data.isComplete,
            // Always set blueprint state to prevent stale data from previous project
            suiteId: data.suiteId || null,
            blueprints: data.blueprints || [],
            activeBlueprint: data.blueprints && data.blueprints.length > 0
                ? (state.activeBlueprint || data.blueprints[0]?.type || null)
                : null,
        })),

    setActiveTab: (tab) => set({ activeTab: tab }),
}));
