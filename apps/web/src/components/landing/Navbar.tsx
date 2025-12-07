import { MagneticLink } from "@/components/ui/MagneticLink";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <Logo />
                </Link>

                <div className="hidden md:flex items-center gap-8 text-xs font-medium tracking-widest uppercase text-zinc-400">
                    <MagneticLink href="/roadmap" className="hover:text-white transition-colors block px-2 py-1">
                        Roadmap
                    </MagneticLink>
                    <MagneticLink href="/changelog" className="hover:text-white transition-colors block px-2 py-1">
                        Changelog
                    </MagneticLink>
                    <MagneticLink href="/features" className="hover:text-white transition-colors block px-2 py-1">
                        Features
                    </MagneticLink>
                    <MagneticLink href="/pricing" className="hover:text-white transition-colors block px-2 py-1">
                        Pricing
                    </MagneticLink>
                    <MagneticLink href="/about" className="hover:text-white transition-colors block px-2 py-1">
                        About
                    </MagneticLink>
                </div>

                <div className="flex items-center gap-6">
                    <Link href="/login" className="text-xs font-medium tracking-widest uppercase text-zinc-400 hover:text-white transition-colors">
                        Login
                    </Link>
                    <Link href="/waitlist">
                        <Button size="sm" variant="default">
                            Join Waitlist
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
