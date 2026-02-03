"use client"
import React, { useState, useEffect } from "react"
import LoadingScreen from "@/components/LoadingScreen"

import { usePathname } from "next/navigation"

export default function AuthLayout({ children }) {
    const [isLoading, setIsLoading] = useState(true)
    const pathname = usePathname()
    const isOverlay = pathname === "/onRecord"

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    if (isOverlay) {
        return <>{children}</>
    }

    return (
        <>
            <LoadingScreen isLoading={isLoading} />
            {children}
        </>
    )
}
