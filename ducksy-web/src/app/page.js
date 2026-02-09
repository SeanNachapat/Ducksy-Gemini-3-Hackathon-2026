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

  // Find Windows installer if available (exe or msi)
  const windowsAsset = assets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
  const downloadUrl = windowsAsset?.browser_download_url || release?.html_url || "https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026/releases";

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

        <div className="flex flex-col gap-4 w-full max-w-md items-center">
          <a
            href={downloadUrl}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-neutral-200 transition-all hover:scale-[1.02] shadow-lg shadow-white/10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            {windowsAsset ? "Download for Windows" : "Download from GitHub"}
          </a>

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
        </div>
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
