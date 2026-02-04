"use client"

import React, { useState, useEffect, useRef } from 'react'

export default function MagicLensPage() {
    const [selection, setSelection] = useState(null)
    const [isDragging, setIsDragging] = useState(false)
    const [startPos, setStartPos] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)

    useEffect(() => {
        document.body.style.backgroundColor = 'transparent'
        document.documentElement.style.backgroundColor = 'transparent'

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (window.electron) {
                    window.electron.send('selection-complete', null)
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleMouseDown = (e) => {
        setIsDragging(true)
        const x = e.clientX
        const y = e.clientY
        setStartPos({ x, y })
        setSelection({ x, y, width: 0, height: 0 })
    }

    const handleMouseMove = (e) => {
        if (!isDragging) return

        const currentX = e.clientX
        const currentY = e.clientY

        const x = Math.min(startPos.x, currentX)
        const y = Math.min(startPos.y, currentY)
        const width = Math.abs(currentX - startPos.x)
        const height = Math.abs(currentY - startPos.y)

        setSelection({ x, y, width, height })
    }

    const handleMouseUp = () => {
        setIsDragging(false)
        if (selection && selection.width > 0 && selection.height > 0) {
            if (window.electron) {
                window.electron.send('selection-complete', selection)
            } else {
                console.log('Selection complete (dev):', selection)
            }
        } else {
            setSelection(null)
        }
    }

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 bg-black/20 z-50 cursor-crosshair select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            {selection && (
                <div
                    className="absolute border-2 border-white bg-white/10 backdrop-blur-[1px]"
                    style={{
                        left: selection.x,
                        top: selection.y,
                        width: selection.width,
                        height: selection.height,
                    }}
                >
                    <div className="absolute -top-6 left-0 bg-black/60 text-white text-xs px-1 rounded">
                        {Math.round(selection.width)} x {Math.round(selection.height)}
                    </div>
                </div>
            )}

            {!isDragging && !selection && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 text-lg font-medium drop-shadow-md pointer-events-none">
                    Click and drag to select an area
                </div>
            )}
        </div>
    )
}
