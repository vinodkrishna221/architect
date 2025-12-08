import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import { Providers } from "@/components/providers/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The Architect | AI-Powered PRD Generator",
    template: "%s | The Architect",
  },
  description:
    "Transform your ideas into production-grade specifications. The Architect interrogates your concept, catches gaps, and creates perfect PRDs for your AI coding agent.",
  keywords: [
    "PRD generator",
    "AI development",
    "product requirements",
    "software architecture",
    "AI coding assistant",
    "specification generator",
  ],
  authors: [{ name: "The Architect Team" }],
  creator: "The Architect",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://thearchitect.dev"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "The Architect",
    title: "The Architect | AI-Powered PRD Generator",
    description:
      "Transform your ideas into production-grade specifications. The Architect interrogates your concept, catches gaps, and creates perfect PRDs for your AI coding agent.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Architect - AI-Powered PRD Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Architect | AI-Powered PRD Generator",
    description:
      "Transform your ideas into production-grade specifications. The Architect interrogates your concept, catches gaps, and creates perfect PRDs for your AI coding agent.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <CustomCursor />
          <div className="fixed inset-0 z-[-1] bg-grid-pattern pointer-events-none [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_70%)]" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
