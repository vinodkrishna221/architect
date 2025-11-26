import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";

export default function Footer() {
    return (
        <footer className="bg-zinc-950 text-zinc-400 py-12 border-t border-zinc-800">
            <Container>
                <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                            <Logo className="w-6 h-6 text-white" showText={false} />
                            <span className="text-white font-bold text-lg">The Architect</span>
                        </div>
                        <p className="text-sm">Stop hallucinating. Start building.</p>
                    </div>
                    <div className="text-sm">
                        &copy; {new Date().getFullYear()} The Architect. All rights reserved.
                    </div>
                </div>
            </Container>
        </footer>
    );
}
