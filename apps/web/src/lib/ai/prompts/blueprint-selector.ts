/**
 * Blueprint Selector
 * Dynamically selects which PRD blueprints to generate based on project type and features
 */

import { ProjectType, FeatureFlag } from "./interrogation";

// Core PRDs that ALL projects need
const CORE_BLUEPRINTS = [
    "mvp-features",
    "backend",
    "database",
    "security",
] as const;

// Project-type specific PRDs
const PROJECT_TYPE_BLUEPRINTS: Record<ProjectType, string[]> = {
    "saas": [
        "design-system",
        "frontend",
    ],
    "marketplace": [
        "design-system",
        "frontend",
        "payment-integration",
        "trust-safety",
    ],
    "mobile": [
        "mobile-architecture",
        "push-notifications",
    ],
    "ecommerce": [
        "design-system",
        "frontend",
        "payment-integration",
    ],
    "internal": [
        "frontend",
    ],
    "api": [
        "api-documentation",
    ],
    "ai-product": [
        "design-system",
        "frontend",
        "prompt-engineering",
    ],
    "cli": [
        "cli-architecture",
    ],
    "iot": [
        "device-communication",
        "frontend",
    ],
};

// Feature-based additional PRDs
const FEATURE_BLUEPRINTS: Partial<Record<FeatureFlag, string>> = {
    "payments": "payment-integration",
    "real-time": "real-time-architecture",
    "notifications": "notification-system",
};

/**
 * Selects which blueprints to generate based on project type and features
 * @param projectType - Detected project type (defaults to "saas")
 * @param detectedFeatures - Features detected during interrogation
 * @returns Array of blueprint types to generate
 */
export function selectBlueprints(
    projectType: ProjectType | null | undefined,
    detectedFeatures: FeatureFlag[] | null | undefined
): string[] {
    const blueprints = new Set<string>();

    // Add core blueprints (always included)
    CORE_BLUEPRINTS.forEach(b => blueprints.add(b));

    // Add project-type specific blueprints
    const typeBlueprints = PROJECT_TYPE_BLUEPRINTS[projectType || "saas"] || [];
    typeBlueprints.forEach(b => blueprints.add(b));

    // Add feature-based blueprints
    (detectedFeatures || []).forEach(feature => {
        const blueprint = FEATURE_BLUEPRINTS[feature];
        if (blueprint) blueprints.add(blueprint);
    });

    return Array.from(blueprints);
}

/**
 * Get the display title for a blueprint type
 */
export function getBlueprintTitle(type: string): string {
    const titles: Record<string, string> = {
        "mvp-features": "MVP Feature List",
        "backend": "Backend Architecture PRD",
        "database": "Database Architecture",
        "security": "Security PRD",
        "design-system": "Design System PRD",
        "frontend": "Frontend Architecture PRD",
        "payment-integration": "Payment Integration PRD",
        "trust-safety": "Trust & Safety PRD",
        "mobile-architecture": "Mobile Architecture PRD",
        "push-notifications": "Push Notifications PRD",
        "api-documentation": "API Documentation PRD",
        "prompt-engineering": "Prompt Engineering PRD",
        "cli-architecture": "CLI Architecture PRD",
        "device-communication": "Device Communication PRD",
        "real-time-architecture": "Real-time Architecture PRD",
        "notification-system": "Notification System PRD",
    };
    return titles[type] || `${type} PRD`;
}
