"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import translations from "../locales/translations.json"

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
    const defaultSettings = {
        language: "en",
        theme: "dark",
        autoStart: true,
        reducedMotion: false,
        personality: 50,
        responses: 50
    }

    const [settings, setSettings] = useState(defaultSettings)
    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
        const savedSettings = localStorage.getItem("ducksy_settings")
        if (savedSettings) {
            try {
                setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
            } catch (e) {
                console.error("Failed to parse settings", e)
            }
        }
        setIsLoaded(true)
    }, [])

    const updateSettings = (newSettings) => {
        setSettings(prev => {
            const updated = { ...prev, ...newSettings }
            localStorage.setItem("ducksy_settings", JSON.stringify(updated))
            return updated
        })
    }

    const saveSettings = () => {
        localStorage.setItem("ducksy_settings", JSON.stringify(settings))
    }

    const t = translations[settings.language] || translations.en

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, saveSettings, t, isLoaded }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    return useContext(SettingsContext)
}
