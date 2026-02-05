"use client"
import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Trash2, ExternalLink, Save, ArrowRight, Sparkles, Database, Settings, Globe, Moon, Sun, Monitor, Link2, Check, Plus, MessageSquare, Mic, Info, Github, Bug, Linkedin, Cpu, Twitter } from "lucide-react"
import Link from "next/link"
import translations from "../../../locales/translations.json"

export default function ConfigurePage() {
    const [activeSection, setActiveSection] = useState("general")
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
    const [showBuilders, setShowBuilders] = useState(false)
    const [contributors, setContributors] = useState([])

    useEffect(() => {
        const fetchContributors = async () => {
            try {
                const response = await fetch("https://api.github.com/repos/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026/contributors")
                if (response.ok) {
                    const data = await response.json()
                    const detailedContributors = await Promise.all(
                        data.slice(0, 6).map(async (contributor) => {
                            try {
                                const userResponse = await fetch(`https://api.github.com/users/${contributor.login}`)
                                if (userResponse.ok) {
                                    const userData = await userResponse.json()
                                    return {
                                        ...contributor,
                                        twitter_username: userData.twitter_username,
                                        blog: userData.blog,
                                        bio: userData.bio,
                                        name: userData.name
                                    }
                                }
                            } catch (e) {
                                console.error("Failed to fetch user details", e)
                            }
                            return contributor
                        })
                    )
                    setContributors(detailedContributors)
                }
            } catch (error) {
                console.error("Failed to fetch contributors", error)
            }
        }
        if (showBuilders && contributors.length === 0) {
            fetchContributors()
        }
    }, [showBuilders])

    useEffect(() => {
        const savedSettings = localStorage.getItem("ducksy_settings")
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings)
            if (!['en', 'th', 'zh', 'ja'].includes(parsed.language)) {
                parsed.language = 'en'
            }
            setSettings(prev => ({ ...prev, ...parsed }))
        }
    }, [])

    const [connections, setConnections] = useState({
        notion: false,
        google: true,
        mcp: false
    })

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
                    alert("Memory cleared successfully! The app will restart...")
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
            window.location.reload()
        }, 800)
    }

    const t = translations[settings.language] || translations.en

    const sections = [
        { id: "general", label: t.nav.general, desc: "Theme & Language", icon: Settings },
        { id: "persona", label: t.nav.persona, desc: "Personality & Voice", icon: Sparkles },
        { id: "memory", label: t.nav.memory, desc: "Context & Storage", icon: Database },
        { id: "connections", label: t.nav.connections, desc: "Integrations & MCP", icon: Link2 },
        { id: "info", label: "Info", desc: "System & About", icon: Info },
    ]

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
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">{t.persona.title}</h2>
                                    <p className="text-neutral-400">{t.persona.desc}</p>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{t.persona.personality}</h3>
                                                <p className="text-xs text-neutral-500">{t.persona.personalityDesc}</p>
                                            </div>
                                        </div>

                                        <div className="px-2">
                                            <div className="flex justify-between text-xs text-neutral-400 mb-2 font-medium">
                                                <span>{t.persona.labels.strict}</span>
                                                <span>{t.persona.labels.creative}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.personality}
                                                onChange={(e) => setSettings({ ...settings, personality: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm space-y-6">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                <MessageSquare className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{t.persona.responses}</h3>
                                                <p className="text-xs text-neutral-500">{t.persona.responsesDesc}</p>
                                            </div>
                                        </div>

                                        <div className="px-2">
                                            <div className="flex justify-between text-xs text-neutral-400 mb-2 font-medium">
                                                <span>{t.persona.labels.concise}</span>
                                                <span>{t.persona.labels.verbose}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.responses}
                                                onChange={(e) => setSettings({ ...settings, responses: parseInt(e.target.value) })}
                                                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                                <Mic className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-semibold text-white">{t.persona.voice}</h3>
                                                <p className="text-xs text-neutral-500">{t.persona.voiceDesc}</p>
                                            </div>
                                        </div>

                                        <select
                                            value={settings.voice}
                                            onChange={(e) => setSettings({ ...settings, voice: e.target.value })}
                                            className="bg-neutral-950 border border-white/10 text-white text-sm rounded-xl px-4 py-2 outline-none focus:border-amber-500/50 transition-colors min-w-[150px]"
                                        >
                                            <option value="echo">Echo</option>
                                            <option value="alloy">Alloy</option>
                                            <option value="shimmer">Shimmer</option>
                                        </select>
                                    </div>
                                </div>
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

                        {activeSection === "info" && (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">Info & About</h2>
                                    <p className="text-neutral-400">System information and application details.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 bg-gradient-to-br from-neutral-900/40 to-neutral-900/20 border border-white/5 p-8 rounded-3xl backdrop-blur-sm flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-2xl flex items-center justify-center">
                                                <img src="/ducksy-logo.svg" alt="Ducksy Logo" className="w-full h-full object-contain" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">Ducksy</h3>
                                                <p className="text-sm text-neutral-400 font-mono mt-1">v1.2.0-alpha</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-500 font-mono uppercase">Electron</span>
                                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-500 font-mono uppercase">React</span>
                                                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] text-neutral-500 font-mono uppercase">Gemini 3</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden md:block text-right">
                                            <p className="text-xs text-neutral-500 font-mono mb-1">BUILD ID</p>
                                            <p className="text-sm text-white font-mono">8f314e4-aa5a</p>
                                        </div>
                                    </div>

                                    <Link href="https://github.com/SeanNachapat/Ducksy-Gemini-3-Hackathon-2026" target="_blank" className="group bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-4 hover:bg-white/5 hover:border-white/10 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <Github className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">View Source</h3>
                                            <p className="text-xs text-neutral-500">Explore the codebase on GitHub</p>
                                        </div>
                                    </Link>

                                    <Link href="#" className="group bg-neutral-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-4 hover:bg-white/5 hover:border-white/10 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                                            <Bug className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-white mb-1 group-hover:text-red-400 transition-colors">Report Issue</h3>
                                            <p className="text-xs text-neutral-500">Found a bug? Let us know.</p>
                                        </div>
                                    </Link>

                                    <div className="md:col-span-2">
                                        <button
                                            onClick={() => setShowBuilders(!showBuilders)}
                                            className="w-full group relative overflow-hidden bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm flex items-center justify-between hover:border-amber-500/30 transition-all text-left"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:text-amber-400 transition-colors">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Meet the Builders</h3>
                                                    <p className="text-sm text-neutral-500">The human minds behind the AI</p>
                                                </div>
                                            </div>

                                            <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 group-hover:bg-amber-500 group-hover:text-black transition-all relative z-10 ${showBuilders ? "rotate-90 bg-amber-500 text-black" : ""}`}>
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {showBuilders && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    className="overflow-hidden space-y-4"
                                                >
                                                    {contributors.length > 0 ? (
                                                        contributors.map((contributor) => (
                                                            <div key={contributor.id} className="bg-neutral-900/40 border border-white/5 p-6 rounded-3xl flex items-center gap-6">
                                                                <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center text-2xl font-bold text-neutral-500 border border-white/5 overflow-hidden">
                                                                    <img src={contributor.avatar_url} alt={contributor.login} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <h4 className="text-base font-bold text-white">{contributor.name || contributor.login}</h4>
                                                                        {contributor.login === "SeanNachapat" && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wide">Project Lead</span>}
                                                                    </div>
                                                                    <p className="text-xs text-neutral-400 mb-2">@{contributor.login}</p>
                                                                    <div className="flex items-center gap-3">
                                                                        <a href={contributor.html_url} target="_blank" className="inline-flex text-neutral-500 hover:text-white transition-colors" title="GitHub"><Github className="w-4 h-4" /></a>
                                                                        {contributor.twitter_username && (
                                                                            <a href={`https://twitter.com/${contributor.twitter_username}`} target="_blank" className="inline-flex text-neutral-500 hover:text-sky-400 transition-colors" title="Twitter">
                                                                                <Twitter className="w-4 h-4" />
                                                                            </a>
                                                                        )}
                                                                        {contributor.blog && (
                                                                            <a href={contributor.blog.startsWith('http') ? contributor.blog : `https://${contributor.blog}`} target="_blank" className="inline-flex text-neutral-500 hover:text-amber-400 transition-colors" title="Website">
                                                                                <ExternalLink className="w-4 h-4" />
                                                                            </a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-center text-neutral-500 text-sm py-4">Loading contributors...</div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>



                                    <div className="md:col-span-2 text-center pt-8 pb-4 space-y-2">
                                        <p className="text-sm text-neutral-500 font-medium">Submitted for Gemini 3 Hackathon 2026</p>
                                        <p className="text-xs text-neutral-600">Made with ❤️ and ☕ in Thailand</p>
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
            </main >
        </div >
    )
}