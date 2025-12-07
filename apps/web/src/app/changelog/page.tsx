import { Changelog } from "@/lib/models";
import dbConnect from "@/lib/db";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { marked } from "marked";

interface ChangelogEntry {
    _id: string;
    version: string;
    title: string;
    content: string;
    date: Date;
}

export const dynamic = "force-dynamic";

// Configure marked for better rendering
marked.setOptions({
    breaks: true,  // Convert \n to <br>
    gfm: true,     // GitHub Flavored Markdown
});

async function getChangelogs() {
    await dbConnect();
    const logs = await Changelog.find({}).sort({ date: -1 }).lean();
    return logs;
}

export default async function ChangelogPage() {
    const changelogs = await getChangelogs();

    return (
        <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-blue-500/30">
            <div className="max-w-3xl mx-auto">
                <header className="mb-16 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500 mb-2">
                            Changelog
                        </h1>
                        <p className="text-zinc-400">Latest updates and improvements.</p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2 rounded-full border border-white/10 hover:bg-white/5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>
                </header>

                <div className="space-y-12 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-0 top-2 bottom-0 w-px bg-gradient-to-b from-blue-500/50 via-white/10 to-transparent md:left-4" />

                    {changelogs.map((log: ChangelogEntry) => (
                        <div key={log._id} className="relative pl-8 md:pl-12 group">
                            {/* Dot */}
                            <div className="absolute left-[-4px] md:left-[13px] top-2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-black group-hover:scale-125 transition-transform duration-300" />

                            <div className="flex flex-col gap-4">
                                <div className="flex items-baseline gap-4">
                                    <span className="text-sm font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20">
                                        {log.version}
                                    </span>
                                    <span className="text-sm text-zinc-500">
                                        {format(new Date(log.date), "MMMM d, yyyy")}
                                    </span>
                                </div>

                                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 hover:bg-zinc-900/50 transition-colors duration-300">
                                    <h2 className="text-xl font-semibold text-white mb-4">
                                        {log.title}
                                    </h2>
                                    {/* Render markdown content */}
                                    <div
                                        className="prose prose-invert prose-sm max-w-none text-zinc-300 
                                            prose-headings:text-white prose-headings:font-semibold
                                            prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                                            prose-ul:my-2 prose-li:my-0.5
                                            prose-code:bg-zinc-800 prose-code:px-1 prose-code:rounded
                                            prose-strong:text-white"
                                        dangerouslySetInnerHTML={{
                                            __html: marked.parse(log.content) as string
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {changelogs.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            <p>No updates yet. Stay tuned!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
