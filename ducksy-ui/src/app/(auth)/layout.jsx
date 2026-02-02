"use client"
import React, { useEffect, useState } from "react"
import WindowControls from "@/components/WindowControls"

export default function AuthLayout({ children }) {
    const [platform, setPlatform] = useState("mac")

    useEffect(() => {
        const userAgent = window.navigator.userAgent.toLowerCase()
        if (userAgent.includes("win")) {
            setPlatform("windows")
        }
    }, [])

    return (
        <div className="relative min-h-screen flex flex-col">
            <div className={`fixed top-0 w-full z-50 flex items-center h-10 bg-neutral-950 border-b border-white/5 ${platform === 'windows' ? 'justify-end pr-2' : 'justify-start pl-6 pt-4'}`}>
                <WindowControls platform={platform} />
            </div>

            <div className={`flex-1 ${platform === 'windows' ? 'pt-8' : 'pt-14'}`}>
                {children}
            </div>
        </div>
    )
}
