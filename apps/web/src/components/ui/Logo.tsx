import React from "react";

export const Logo = ({ className = "w-8 h-8", showText = true }: { className?: string, showText?: boolean }) => {
    return (
        <div className="flex items-center gap-2">
            <img
                src="/favicon.ico"
                alt="The Architect Logo"
                className={className}
            />
            {showText && (
                <span className="font-bold text-lg tracking-tight text-white">The Architect</span>
            )}
        </div>
    );
};
