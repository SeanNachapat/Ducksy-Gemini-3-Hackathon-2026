"use client"

import React, { useState } from 'react'

const CONFIG = {
    videoUrl: 'https://www.youtube.com/embed/_XMQErOkuMg',
    githubUrl: 'https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026',
    downloadUrl: 'https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026/releases/latest'
}

const LandingPage = ({ initialVersion, initialWindowsDownloadUrl, initialMacDownloadUrl }) => {
    const [showTooltip, setShowTooltip] = useState(false)

    const version = initialVersion || "v1.0.0"
    const windowsDownloadUrl = initialWindowsDownloadUrl || CONFIG.downloadUrl
    const macDownloadUrl = initialMacDownloadUrl || CONFIG.downloadUrl

    return (
        <div className="flex bg-[#0a0a0a] text-white font-sans selection:bg-amber-500/30 overflow-hidden relative h-screen w-screen">
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/5 blur-[100px] rounded-full" />
            </div>

            <main className="relative z-10 flex flex-col items-center justify-center w-full h-full p-6 animate-fade-in gap-6">

                <div className="text-center flex flex-col items-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="relative w-10 h-10 group">
                            <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/30 transition-all"></div>
                            <img src="/ducksy-logo.svg" alt="Ducksy Logo" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Ducksy</h1>
                    </div>
                    <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-medium text-amber-500">
                        <span>{version}</span>
                        <span className="text-amber-500/50">•</span>
                        <span>Powered by Gemini 3</span>
                    </div>
                </div>

                <div className="w-full max-w-2xl aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center relative group shrink-0">
                    <div className="absolute -inset-1 bg-linear-to-r from-amber-500 to-amber-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-500"></div>

                    <div className="relative w-full h-full bg-[#0a0a0a] rounded-2xl flex items-center justify-center z-10 overflow-hidden">
                        {CONFIG.videoUrl ? (
                            <iframe
                                src={CONFIG.videoUrl}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <div className="text-center p-8">
                                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-amber-500 ml-0.5"><path d="M8 5v14l11-7z" /></svg>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-1">Watch Demo</h3>
                                <p className="text-xs text-neutral-500 max-w-xs">See Ducksy in action. The native AI workspace.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-2xl">
                    <a
                        href={macDownloadUrl}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-amber-500 hover:bg-amber-400 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.21-1.98 1.07-3.11-1.04.05-2.29.69-3.02 1.55-.65.75-1.21 1.95-1.06 3.04 1.15.09 2.3-.64 3.01-1.48" /></svg>
                        <span>Mac</span>
                    </a>

                    <a
                        href={windowsDownloadUrl}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-amber-500 hover:bg-amber-400 transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M0 3.449L9.75 2.1v9.451H0v-8.102zm10.949-1.67L24 0v11.551H10.949V1.78zm-10.949 10.929h9.75v8.1l-9.75-1.35v-6.75zm10.949 0h13.051v9.541L10.949 20.45v-7.74z" /></svg>
                        <span>Windows</span>
                    </a>

                    <div className="relative group">
                        <a
                            href={CONFIG.githubUrl || '#'}
                            onMouseEnter={() => !CONFIG.githubUrl && setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all hover:scale-[1.02] ${!CONFIG.githubUrl ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                            <span>GitHub</span>
                        </a>
                        {showTooltip && !CONFIG.githubUrl && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-neutral-800 text-[10px] text-white rounded-lg shadow-xl whitespace-nowrap z-100 border border-white/10">
                                Private Repo
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-800" />
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-4 text-[10px] text-neutral-600 flex gap-4">
                    <a href="/tos" className="hover:text-neutral-400">Terms</a>
                    <a href="/privacy" className="hover:text-neutral-400">Privacy</a>
                </div>
            </main>
        </div>
    )
}

export default LandingPage
