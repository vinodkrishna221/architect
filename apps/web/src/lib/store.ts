import { create } from 'zustand';
import { Project, MOCK_PROJECTS } from './mock-data';

interface DashboardState {
    view: 'ARCHIVE' | 'PROJECT';
    activeProjectId: string | null;
    dockItems: Project[];

    // Actions
    openProject: (id: string) => void;
    closeProject: (id: string) => void;
    minimizeProject: () => void;
    addToDock: (project: Project) => void;
    removeFromDock: (id: string) => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    view: 'ARCHIVE',
    activeProjectId: null,
    dockItems: [], // Initially empty, or could pre-fill with recent

    openProject: (id: string) => {
        const project = MOCK_PROJECTS.find(p => p.id === id);
        if (!project) return;

        set((state) => {
            // Add to dock if not present
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
    }
}));
