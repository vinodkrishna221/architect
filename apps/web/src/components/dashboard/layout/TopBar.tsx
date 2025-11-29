import { User } from "lucide-react";
import { MagneticButton } from "../../shared/MagneticButton";

export function TopBar() {
    return (
        <header className="fixed top-0 left-0 right-0 h-16 z-50 flex items-center justify-between px-6 border-b border-white/5 bg-black/50 backdrop-blur-xl">
            {/* Branding */}
            <div className="flex items-center gap-2">
                <MagneticButton>
                    <span className="font-mono font-bold tracking-tighter text-white text-lg hover:text-white/80 transition-colors cursor-pointer">
                        THE_ARCHITECT
                    </span>
                </MagneticButton>
            </div>

            {/* Right Side: Credits & User */}
            <div className="flex items-center gap-4">
                {/* Credits Display */}
                <MagneticButton className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <span className="text-[10px] font-mono text-zinc-400 tracking-wider">CREDITS:</span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">2/3</span>
                </MagneticButton>

                {/* User Menu */}
                <MagneticButton className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center hover:bg-zinc-700 transition-colors">
                    <User className="w-4 h-4 text-zinc-400" />
                </MagneticButton>
            </div>
        </header>
    );
}
