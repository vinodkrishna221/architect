import React from "react";

export const Logo = ({ className = "w-8 h-8", showText = true }: { className?: string, showText?: boolean }) => {
    return (
        <div className="flex items-center gap-2">
            <svg
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
                aria-label="The Architect Logo"
            >
                {/* Left Pillar - Solid Structure (Stability) */}
                <path
                    d="M16 2L4 28H10L16 14"
                    fill="currentColor"
                    className="text-black dark:text-white"
                />

                {/* Right Pillar - Outline/Blueprint (Planning) */}
                <path
                    d="M16 2L28 28H22L16 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-zinc-400"
                />

                {/* The "Keystone" / Connection - Accent Color */}
                <rect
                    x="13"
                    y="14"
                    width="6"
                    height="4"
                    fill="#CCFF00"
                    className="rotate-0"
                />

                {/* Digital/Code Accent - A cursor or pixel */}
                <rect x="26" y="26" width="4" height="4" fill="#CCFF00" />
            </svg>
            {showText && (
                <span className="font-bold text-lg tracking-tight">The Architect</span>
            )}
        </div>
    );
};
