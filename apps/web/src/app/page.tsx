import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import ProblemSection from "@/components/landing/ProblemSection";
import SolutionSection from "@/components/landing/SolutionSection";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-white/20">
      <div className="fixed inset-0 bg-grid-pattern pointer-events-none" />
      <div className="fixed inset-0 bg-noise pointer-events-none z-50" />
      <Navbar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <CTA />
      {/* Keeping existing Footer for now, or we can remove/update it later */}
      <Footer />
    </main>
  );
}
