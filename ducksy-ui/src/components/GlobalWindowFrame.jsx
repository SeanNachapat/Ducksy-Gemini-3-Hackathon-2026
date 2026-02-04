"use client"
import React, { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import WindowControls from "@/components/WindowControls"

export default function GlobalWindowFrame({ children }) {
    const [platform, setPlatform] = useState("mac")
    const pathname = usePathname()
    const isLanding = pathname === "/"
    const isOverlay = pathname === "/onRecord"

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase()
        if (userAgent.includes("win")) {
            setPlatform("windows")
        }
    }, [])

    if (isOverlay) {
        return (
            <div className="h-screen w-screen bg-transparent">
                {children}
            </div>
        )
    }

    return (
        <div className="relative h-screen flex flex-col overflow-hidden">
            <div className={`fixed top-0 w-full z-50 flex items-center h-10 bg-linear-to-b from-black to-transparent pointer-events-none ${platform === 'windows' ? 'justify-end pr-4 pt-2 items-start' : 'justify-start pl-6 pt-4 items-start'}`} style={{ WebkitAppRegion: 'drag' }}>
                <div className="pointer-events-auto" style={{ WebkitAppRegion: 'no-drag' }}>
                    <WindowControls platform={platform} />
                </div>
            </div>

            <div className={`flex-1 w-full h-full ${isLanding ? '' : 'pt-[18px]'}`}>
                {children}
            </div>
        </div>
    )
}
