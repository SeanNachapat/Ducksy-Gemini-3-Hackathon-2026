import LandingPage from "@/components/LandingPage";

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
  const version = release?.tag_name || "v1.0.0";
  const assets = release?.assets || [];

  // Find assets
  const windowsAsset = assets.find(a => a.name.endsWith('.exe') || a.name.endsWith('.msi'));
  const downloadUrl = windowsAsset?.browser_download_url || release?.html_url || "https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026/releases";

  // Pass data to Client Component
  return <LandingPage initialVersion={version} initialDownloadUrl={downloadUrl} />;
}
