"use client"
import React, { useState, useEffect } from "react"
import LoadingScreen from "@/components/LoadingScreen"

export default function AuthLayout({ children }) {
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            <LoadingScreen isLoading={isLoading} />
            {children}
        </>
    )
}
