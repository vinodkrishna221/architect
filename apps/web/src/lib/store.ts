import { create } from 'zustand';
import { Project } from './mock-data';

// API Project type (from MongoDB)
export interface ApiProject {
    id: string;
    title: string;
    description: string;
    status: 'DRAFT' | 'GENERATING' | 'COMPLETED' | 'AWAITING_ANSWERS';
    createdAt: string;
    updatedAt: string;
}

// Convert API project to local format
function apiToLocal(project: ApiProject): Project {
    return {
        id: project.id,
        title: project.title,
        status: project.status,
        description: project.description,
        updatedAt: new Date(project.updatedAt),
    };
}

interface DashboardState {
    view: 'ARCHIVE' | 'PROJECT';
    activeProjectId: string | null;
    dockItems: Project[];

    // API-driven state
    projects: Project[];
    isLoading: boolean;
    error: string | null;

    // User stats (credit system)
    credits: number;
    maxCredits: number;

    // Actions
    openProject: (id: string) => void;
    closeProject: (id: string) => void;
    minimizeProject: () => void;
    addToDock: (project: Project) => void;
    removeFromDock: (id: string) => void;

    // API actions
    fetchProjects: () => Promise<void>;
    createProject: (title: string, description?: string, projectType?: string) => Promise<ApiProject | null>;
    deleteProject: (id: string) => Promise<boolean>;
    fetchUserStats: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    view: 'ARCHIVE',
    activeProjectId: null,
    dockItems: [],
    projects: [],
    isLoading: false,
    error: null,
    credits: 30,
    maxCredits: 30,

    openProject: (id: string) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;

        set((state) => {
            const isInDock = state.dockItems.some(p => p.id === id);
            const newDockItems = isInDock ? state.dockItems : [...state.dockItems, project];

            return {
                view: 'PROJECT',
                activeProjectId: id,
                dockItems: newDockItems
            };
        });
    },

    closeProject: (id: string) => {
        set((state) => ({
            dockItems: state.dockItems.filter(p => p.id !== id),
            view: state.activeProjectId === id ? 'ARCHIVE' : state.view,
            activeProjectId: state.activeProjectId === id ? null : state.activeProjectId
        }));
    },

    minimizeProject: () => {
        set({ view: 'ARCHIVE', activeProjectId: null });
    },

    addToDock: (project: Project) => {
        set((state) => {
            if (state.dockItems.some(p => p.id === project.id)) return state;
            return { dockItems: [...state.dockItems, project] };
        });
    },

    removeFromDock: (id: string) => {
        set((state) => ({
            dockItems: state.dockItems.filter(p => p.id !== id)
        }));
    },

    fetchProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/projects');
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            const projects = (data.projects || []).map(apiToLocal);
            set({ projects, isLoading: false });
        } catch (error) {
            console.error('Error fetching projects:', error);
            // Show error state - no mock data fallback
            set({
                projects: [],
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch projects'
            });
        }
    },

    createProject: async (title: string, description?: string, projectType?: string) => {
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, projectType: projectType || 'saas' }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create project');
            }

            // Add to projects list and dock
            const newProject = apiToLocal(data.project);
            set((state) => ({
                projects: [newProject, ...state.projects],
                dockItems: [...state.dockItems, newProject],
                credits: data.credits ?? state.credits,
            }));

            return data.project;
        } catch (error) {
            console.error('Error creating project:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to create project' });
            return null;
        }
    },

    deleteProject: async (id: string) => {
        try {
            const response = await fetch(`/api/projects/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete project');
            }

            // Remove from projects list and dock
            set((state) => ({
                projects: state.projects.filter(p => p.id !== id),
                dockItems: state.dockItems.filter(p => p.id !== id),
                activeProjectId: state.activeProjectId === id ? null : state.activeProjectId,
                view: state.activeProjectId === id ? 'ARCHIVE' : state.view,
            }));

            return true;
        } catch (error) {
            console.error('Error deleting project:', error);
            set({ error: error instanceof Error ? error.message : 'Failed to delete project' });
            return false;
        }
    },

    fetchUserStats: async () => {
        try {
            const response = await fetch('/api/user/stats');
            if (!response.ok) return;

            const data = await response.json();
            set({
                credits: data.credits ?? 30,
                maxCredits: data.maxCredits ?? 30,
            });
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    },
}));
