import { ProjectStatus } from "./types";
export type { ProjectStatus };

export interface Project {
    id: string;
    title: string;
    status: ProjectStatus;
    updatedAt: Date;
    description?: string;
}

const TITLES = [
    "Uber for Dog Walkers",
    "AI Code Reviewer",
    "Crypto Trading Bot",
    "Personal Finance Tracker",
    "Smart Home Dashboard",
    "E-commerce Analytics Platform",
    "Social Media Scheduler",
    "Fitness Tracking App",
    "Recipe Recommendation Engine",
    "Virtual Event Platform",
    "Task Management System",
    "Language Learning App",
    "Travel Itinerary Planner",
    "Inventory Management Tool",
    "Customer Support Chatbot",
    "Real Estate Listing Site",
    "Job Board Aggregator",
    "Podcast Hosting Platform",
    "Video Streaming Service",
    "Music Discovery App"
];

const STATUSES: ProjectStatus[] = ['DRAFT', 'GENERATING', 'COMPLETED', 'AWAITING_ANSWERS'];

function generateMockProjects(count: number): Project[] {
    return Array.from({ length: count }, (_, i) => {
        const title = TITLES[i % TITLES.length] + (i > TITLES.length ? ` ${Math.floor(i / TITLES.length) + 1}` : '');
        const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
        // Random date within the last 30 days
        const updatedAt = new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30));

        return {
            id: `proj_${i + 1}`,
            title,
            status,
            updatedAt,
            description: `A revolutionary ${title.toLowerCase()} built with modern tech stack.`
        };
    }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export const MOCK_PROJECTS = generateMockProjects(52);
