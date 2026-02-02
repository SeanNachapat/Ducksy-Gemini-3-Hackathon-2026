"use client"
import React, { useState, useEffect } from "react"
import { X, Minus, Maximize2, Minimize2, Square } from "lucide-react"

export default function WindowControls({ platform = 'mac' }) {
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`)
            })
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
            }
        }
    }

    const handleClose = () => {
        console.log("Close window triggered")
    }

    const handleMinimize = () => {
        console.log("Minimize window triggered")
    }

    if (platform === 'windows') {
        return (
            <div className="flex items-center h-full">
                <button
                    onClick={handleMinimize}
                    className="h-8 w-11 flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Minimize"
                >
                    <Minus className="w-2.5 h-2.5 text-white" />
                </button>
                <button
                    onClick={toggleFullscreen}
                    className="h-8 w-11 flex items-center justify-center hover:bg-white/10 transition-colors"
                    aria-label="Toggle Fullscreen"
                >
                    {isFullscreen ? (
                        <Minimize2 className="w-2.5 h-2.5 text-white" />
                    ) : (
                        <Square className="w-2.5 h-2.5 text-white" />
                    )}
                </button>
                <button
                    onClick={handleClose}
                    className="h-8 w-11 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Close"
                >
                    <X className="w-3.5 h-3.5 text-white" />
                </button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2 group/controls">
            <button
                onClick={handleClose}
                className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#E0443E] flex items-center justify-center relative overflow-hidden"
                aria-label="Close"
            >
                <X className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover/controls:opacity-100 transition-opacity absolute" strokeWidth={3} />
            </button>
            <button
                onClick={handleMinimize}
                className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123] flex items-center justify-center relative overflow-hidden"
                aria-label="Minimize"
            >
                <Minus className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover/controls:opacity-100 transition-opacity absolute" strokeWidth={3} />
            </button>
            <button
                onClick={toggleFullscreen}
                className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#1AAB29] flex items-center justify-center relative overflow-hidden"
                aria-label="Toggle Fullscreen"
            >
                {isFullscreen ? (
                    <Minimize2 className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover/controls:opacity-100 transition-opacity absolute" strokeWidth={3} />
                ) : (
                    <Maximize2 className="w-1.5 h-1.5 text-black/50 opacity-0 group-hover/controls:opacity-100 transition-opacity absolute" strokeWidth={3} />
                )}
            </button>
        </div>
    )
}
