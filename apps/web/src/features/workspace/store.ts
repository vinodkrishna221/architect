"use client";

import { create } from "zustand";
import { Message, Blueprint } from "@/lib/types";

// Re-export for backward compatibility
export type { Message, Blueprint };

// Interrogation state
interface InterrogationState {
    conversationId: string | null;
    messages: Message[];
    isComplete: boolean;
    isLoading: boolean;
    questionsAsked: number;
}

// Blueprint state
interface BlueprintState {
    suiteId: string | null;
    blueprints: Blueprint[];
    activeBlueprint: string | null;
    isGenerating: boolean;
    generationProgress: { completed: number; total: number };
}

// Combined workspace state
interface WorkspaceState extends InterrogationState, BlueprintState {
    // Interrogation actions
    setConversationId: (id: string) => void;
    addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
    setComplete: (complete: boolean) => void;
    setLoading: (loading: boolean) => void;
    setQuestionsAsked: (count: number) => void;

    // Blueprint actions
    setSuiteId: (id: string) => void;
    setBlueprints: (blueprints: Blueprint[]) => void;
    updateBlueprint: (id: string, updates: Partial<Blueprint>) => void;
    setActiveBlueprint: (type: string) => void;
    setGenerating: (generating: boolean) => void;
    setGenerationProgress: (completed: number, total: number) => void;

    // Utility actions
    reset: () => void;
}

const initialState: InterrogationState & BlueprintState = {
    // Interrogation
    conversationId: null,
    messages: [],
    isComplete: false,
    isLoading: false,
    questionsAsked: 0,

    // Blueprints
    suiteId: null,
    blueprints: [],
    activeBlueprint: null,
    isGenerating: false,
    generationProgress: { completed: 0, total: 6 },
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
}));
