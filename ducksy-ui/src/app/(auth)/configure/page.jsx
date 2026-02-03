"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Trash2, ExternalLink, Save, ArrowRight, Sparkles, Database, Settings, Globe, Moon, Sun, Monitor, Link2, Check, Plus } from "lucide-react"
import Link from "next/link"
import translations from "../../../locales/translations.json"

export default function ConfigurePage() {
    const [activeSection, setActiveSection] = useState("persona")
    const [clearing, setClearing] = useState(false)
    const [settings, setSettings] = useState({
        personality: 50,
        responses: 50,
        voice: "echo",
        autoStart: true,
        theme: "dark",
        language: "en",
        reducedMotion: false
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const savedSettings = localStorage.getItem("ducksy_settings")
        if (savedSettings) {
            setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }))
        }
    }, [])

    const [connections, setConnections] = useState({
        notion: false,
        google: true,
        mcp: false
    })

    // Initial state เป็น null เพื่อเช็คได้ว่า "กำลังโหลด"
    const [sizeCache, setSizeCache] = useState({
        status: "",
        percent: null,
        size: null,
    })

    useEffect(() => {
        if (!window.electron) return;

        if (activeSection === "memory") {
            setSizeCache({ status: "", percent: null, size: null })

            console.log("request-sizeCache")
            window.electron.invoke("request-sizeCache").then((event) => {
                const { status, percent, size } = event
                console.log(event)
                setSizeCache({ status, percent, size })
            })
        }
    }, [activeSection])

    const handleClearMemory = () => {
        setClearing(true)
        if (window.electron) {
            window.electron.invoke("delete-db").then((event) => {
                console.log(event)
                if (event?.success) {
                    alert("ลบข้อมูลสำเร็จ! แอปจะ restart...")
                } else {
                    alert("Error: " + (event?.error || "Unknown error"))
                    setClearing(false)
                }
            }).catch((err) => {
                alert("Error: " + err.message)
                setClearing(false)
            })
        }
    }

    const handleSave = () => {
        setSaving(true)
        setTimeout(() => {
            localStorage.setItem("ducksy_settings", JSON.stringify(settings))
            setSaving(false)
            alert("Configuration Saved Successfully!")
        }, 800)
    }

    const t = translations[settings.language] || translations.en

    const sections = [
        { id: "general", label: t.nav.general, desc: "Theme & Language", icon: Settings },
        { id: "persona", label: t.nav.persona, desc: "Personality & Voice", icon: Sparkles },
        { id: "memory", label: t.nav.memory, desc: "Context & Storage", icon: Database },
        { id: "connections", label: t.nav.connections, desc: "Integrations & MCP", icon: Link2 },
    ]

    // Helper สำหรับเลือกสีตาม Status (แก้ปัญหา Dynamic Class ของ Tailwind)
    const getStatusColor = (status) => {
        if (status === 'warning') return { text: 'text-amber-500', bg: 'bg-amber-500', bgSoft: 'bg-amber-500/10' };
        if (status === 'danger') return { text: 'text-red-500', bg: 'bg-red-500', bgSoft: 'bg-red-500/10' };
        return { text: 'text-emerald-500', bg: 'bg-emerald-500', bgSoft: 'bg-emerald-500/10' };
    }

    return (
        <div className="flex h-full bg-neutral-950 text-white font-sans selection:bg-amber-500/30 overflow-hidden relative">
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

            <aside className="w-80 border-r border-white/5 flex flex-col relative z-20 bg-neutral-900/30 backdrop-blur-md">
                <div className="p-6 border-b border-white/5 space-y-6">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 text-neutral-400 hover:text-white transition-all">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                                Settings
                            </h1>
                            <p className="text-[10px] text-neutral-500 font-mono mt-0.5 uppercase tracking-wider">System.Config.V3</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {sections.map((section) => {
                        const Icon = section.icon
                        return (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left p-4 rounded-xl group transition-all duration-300 relative overflow-hidden border ${activeSection === section.id
                                    ? "bg-amber-500/10 border-amber-500/20"
                                    : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`p-2 rounded-lg ${activeSection === section.id ? "bg-amber-500/20 text-amber-500" : "bg-white/5 text-neutral-500 group-hover:text-neutral-300"}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className={`text-sm font-semibold transition-colors ${activeSection === section.id ? "text-white" : "text-neutral-400 group-hover:text-white"
                                            }`}>
                                            {section.label}
                                        </h3>
                                        <p className="text-[10px] text-neutral-500 font-medium mt-0.5">{section.desc}</p>
                                    </div>
                                    {activeSection === section.id && (
                                        <div className="ml-auto">
                                            <ArrowRight className="w-4 h-4 text-amber-500" />
                                        </div>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative z-10 bg-neutral-950/50">
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeSection === "persona" && (
                            <motion.div
                                key="persona"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-2">Agent Persona</h2></div>
                            </motion.div>
                        )}

                        {activeSection === "memory" && (
                            <motion.div
                                key="memory"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Memory Module</h2>
                                    <p className="text-neutral-400">Manage the agent's long-term memory and context.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="border border-white/5 bg-neutral-900/40 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm min-h-[180px] flex flex-col justify-center">

                                        {sizeCache.percent === null ? (
                                            <div className="animate-pulse flex flex-col md:flex-row md:items-center justify-between gap-8">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-white/10 rounded-lg"></div>
                                                        <div className="h-4 w-24 bg-white/10 rounded"></div>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <div className="h-10 w-32 bg-white/10 rounded"></div>
                                                    </div>
                                                    <div className="h-3 w-40 bg-white/5 rounded"></div>
                                                </div>
                                                <div className="flex-1 max-w-sm space-y-2">
                                                    <div className="flex justify-between">
                                                        <div className="h-3 w-10 bg-white/5 rounded"></div>
                                                        <div className="h-3 w-8 bg-white/5 rounded"></div>
                                                    </div>
                                                    <div className="h-2 w-full bg-neutral-800 rounded-full"></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className={`p-2 rounded-lg ${getStatusColor(sizeCache.status).bgSoft} ${getStatusColor(sizeCache.status).text}`}>
                                                            <Database className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-base font-semibold text-white">Cache Status</h3>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <div className="text-5xl font-bold tracking-tight text-white">
                                                            {sizeCache.size}
                                                        </div>
                                                        <span className="text-xl text-neutral-500 font-medium">MB</span>
                                                    </div>
                                                    <p className="text-sm text-neutral-500 mt-2">
                                                        Local Vector Storage Usage
                                                    </p>
                                                </div>

                                                <div className="flex-1 max-w-sm">
                                                    <div className="flex justify-between text-xs font-medium mb-2">
                                                        <span className="text-white">Usage</span>
                                                        <span className={`${getStatusColor(sizeCache.status).text}`}>
                                                            {Number(sizeCache?.percent).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getStatusColor(sizeCache.status).bg} rounded-full transition-all duration-700 ease-out`}
                                                            style={{ width: `${sizeCache?.percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleClearMemory}
                                        disabled={clearing}
                                        className="group bg-red-500/5 border border-red-500/10 p-8 rounded-3xl flex items-center justify-between hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer relative overflow-hidden"
                                    >
                                        <div className="flex items-center gap-6 relative z-10">
                                            <div className="p-4 rounded-2xl bg-red-500/10 text-red-500 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                                                <Trash2 className="w-6 h-6" strokeWidth={2} />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-lg font-bold text-red-400 group-hover:text-red-300 mb-1">
                                                    {clearing ? "Data Purge in Progress..." : "Purge Entire Memory"}
                                                </h3>
                                                <p className="text-sm text-red-400/60">
                                                    Irreversible action. Clears all context & vector db.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="relative z-10 w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                                            <ArrowRight className="w-5 h-5" />
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeSection === "connections" && (
                            <motion.div
                                key="connections"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Connections & MCP</h2>
                                    <p className="text-neutral-400">Connect external accounts and Model Context Protocol servers.</p>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between group hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black font-bold text-xl">
                                                N
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Notion</h3>
                                                <p className="text-xs text-neutral-500">Workspace & Page Access</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConnections(prev => ({ ...prev, notion: !prev.notion }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${connections.notion
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                                                : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                                                }`}
                                        >
                                            {connections.notion ? "Connected" : "Connect"}
                                        </button>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm flex items-center justify-between group hover:border-white/10 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black font-bold text-xl overflow-hidden p-2">
                                                <svg viewBox="0 0 24 24" className="w-full h-full">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">Google Workspace</h3>
                                                <p className="text-xs text-neutral-500">Drive, Calendar, & Mail</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setConnections(prev => ({ ...prev, google: !prev.google }))}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${connections.google
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20"
                                                : "bg-white/5 border-white/5 text-white hover:bg-white/10"
                                                }`}
                                        >
                                            {connections.google ? "Connected" : "Connect"}
                                        </button>
                                    </div>


                                    <div className="bg-neutral-900/40 border border-amber-500/20 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Settings className="w-24 h-24 text-amber-500" />
                                        </div>

                                        <div className="flex items-center justify-between z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                                                    <Link2 className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-semibold text-white">Add MCP Server</h3>
                                                    <p className="text-xs text-neutral-500">Model Context Protocol</p>
                                                </div>
                                            </div>
                                            <button className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black hover:bg-amber-400 transition-colors">
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 z-10">
                                            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                    <span className="text-sm font-mono text-neutral-300">std-io:filesystem-server</span>
                                                </div>
                                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-neutral-500 font-mono">ACTIVE</span>
                                            </div>
                                            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center justify-between opacity-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                    <span className="text-sm font-mono text-neutral-300">http:slack-context-server</span>
                                                </div>
                                                <span className="text-[10px] bg-red-500/10 px-2 py-1 rounded text-red-500 border border-red-500/20 font-mono">OFFLINE</span>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}

                        {activeSection === "general" && (
                            <motion.div
                                key="general"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">{t.general.title}</h2>
                                    <p className="text-neutral-400">{t.general.desc}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">

                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-neutral-100/10 text-white">
                                                <Moon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{t.general.appearance}</h3>
                                                <p className="text-xs text-neutral-500">{t.general.appearanceDesc}</p>
                                            </div>
                                        </div>

                                        <select
                                            value={settings.theme}
                                            onChange={(e) => setSettings({ ...settings, theme: e.target.value })}
                                            className="bg-neutral-900 border border-white/10 text-neutral-500 text-sm rounded-xl px-4 py-2 outline-none focus:border-amber-500/50 transition-colors w-36"
                                            disabled={true}
                                        >
                                            <option value="dark">Dark Mode</option>
                                        </select>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <Globe className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{t.general.language}</h3>
                                                <p className="text-xs text-neutral-500">{t.general.languageDesc}</p>
                                            </div>
                                        </div>

                                        <select
                                            value={settings.language}
                                            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                            className="bg-neutral-950 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-amber-500/50 transition-colors"
                                        >
                                            <option value="en">English (US)</option>
                                            <option value="th">ไทย (Thai)</option>
                                            <option value="zh">中文 (Chinese)</option>
                                            <option value="ja">日本語 (Japanese)</option>
                                        </select>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-base font-semibold text-white block">{t.general.autoLaunch}</label>
                                                <p className="text-xs text-neutral-500">{t.general.autoLaunchDesc}</p>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, autoStart: !settings.autoStart })}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.autoStart ? "bg-amber-500" : "bg-neutral-800"}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.autoStart ? "translate-x-6" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        <div className="h-px bg-white/5" />

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-base font-semibold text-white block">{t.general.reducedMotion}</label>
                                                <p className="text-xs text-neutral-500">{t.general.reducedMotionDesc}</p>
                                            </div>
                                            <button
                                                onClick={() => setSettings({ ...settings, reducedMotion: !settings.reducedMotion })}
                                                className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.reducedMotion ? "bg-amber-500" : "bg-neutral-800"}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${settings.reducedMotion ? "translate-x-6" : "translate-x-0"}`} />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <div className="h-24 px-12 border-t border-white/5 flex items-center justify-between bg-neutral-900/50 backdrop-blur-xl">
                    <div className="text-xs text-neutral-500 font-medium">
                        <span className="text-neutral-600 mr-2">LAST SAVE</span>
                        Just now
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-3 bg-amber-500 text-neutral-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> Save Configuration
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    )
}