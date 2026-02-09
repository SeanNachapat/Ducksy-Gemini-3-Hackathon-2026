import Image from "next/image";
import Link from "next/link";

async function getLatestRelease() {
  try {
    const res = await fetch('https://api.github.com/repos/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026/releases/latest', {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error("Failed to fetch release:", res.status, res.statusText);
      return null;
    }

    return res.json();
  } catch (e) {
    console.error("Error fetching release:", e);
    return null;
  }
}

export default async function Home() {
  const release = await getLatestRelease();
  const version = release?.tag_name || "Latest";
  const assets = release?.assets || [];

  // Find assets
  const windowsAsset = assets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
  const macAsset = assets.find(a => a.name.endsWith('.dmg') || a.name.endsWith('.pkg')); // Assuming DMG or PKG for Mac

  const fallbackUrl = release?.html_url || "https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026/releases";

  // Format date
  const publishDate = release?.published_at ? new Date(release.published_at).toLocaleDateString() : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-white p-4">
      <main className="flex flex-col items-center justify-center gap-8 max-w-2xl text-center w-full">
        <div className="relative w-32 h-32 mb-4">
          <Image
            src="/ducksy-logo.svg"
            alt="Ducksy Logo"
            width={128}
            height={128}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-5xl font-bold tracking-tight text-white mb-2">
          Ducksy
        </h1>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm font-medium text-neutral-300">
          <span>{version}</span>
          {publishDate && <span className="text-neutral-500">• {publishDate}</span>}
        </div>

        <p className="text-xl text-neutral-400 max-w-lg mb-6">
          Your intelligent desktop assistant powered by Gemini.
          Seamlessly integrate AI into your workflow.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl mx-auto">
          {/* Windows Download */}
          <a
            href={windowsAsset?.browser_download_url || fallbackUrl}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg md:text-xl transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl ${windowsAsset ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z" /><path d="M9 4h6v2H9z" /></svg>
            <span className="whitespace-nowrap">{windowsAsset ? "Download for Windows" : "Windows"}</span>
          </a>

          {/* Mac Download */}
          <a
            href={macAsset?.browser_download_url || fallbackUrl}
            className={`flex-1 flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-bold text-lg md:text-xl transition-all hover:scale-[1.02] shadow-lg hover:shadow-xl ${macAsset ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" ry="2" /><line x1="12" x2="12" y1="4" y2="20" /><line x1="2" x2="22" y1="12" y2="12" /></svg>
            <span className="whitespace-nowrap">{macAsset ? "Download for Mac" : "Mac"}</span>
          </a>
        </div>

        {/* Release Notes */}
        {release?.body && (
          <div className="w-full mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
            <h3 className="text-lg font-semibold mb-4 text-white p-2 border-b border-white/10">Release Notes</h3>
            <div className="prose prose-invert prose-sm max-w-none text-neutral-300 overflow-y-auto max-h-60 whitespace-pre-wrap">
              {release.body}
            </div>
          </div>
        )}

        {!release && (
          <div className="p-4 rounded-lg bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            No releases found. Check back soon!
          </div>
        )}
      </main>

      <footer className="mt-16 flex gap-6 text-sm text-neutral-500">
        <Link href="/tos" className="hover:text-white transition-colors">
          Terms of Service
        </Link>
        <Link href="/privacy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <a href="https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026" className="hover:text-white transition-colors">
          GitHub
        </a>
      </footer>
    </div>
  );
}
