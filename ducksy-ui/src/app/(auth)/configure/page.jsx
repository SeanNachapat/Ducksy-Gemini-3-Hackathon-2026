"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Trash2, ExternalLink, Save, ArrowRight, Sparkles, Database, Settings } from "lucide-react"
import Link from "next/link"

export default function ConfigurePage() {
    const [activeSection, setActiveSection] = useState("persona")
    const [clearing, setClearing] = useState(false)
    const [settings, setSettings] = useState({
        personality: 50,
        responses: 50,
        voice: "echo",
        autoStart: true
    })

    const handleClearMemory = () => {
        setClearing(true)
        setTimeout(() => {
            setClearing(false)
            alert("MEMORY_PURGED")
        }, 1500)
    }

    const sections = [
        { id: "persona", label: "Agent Persona", desc: "Personality & Voice", icon: Sparkles },
        { id: "memory", label: "Memory Module", desc: "Context & Storage", icon: Database },
    ]

    return (
        <div className="flex h-screen bg-neutral-950 text-white font-sans selection:bg-amber-500/30 overflow-hidden relative">
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

                <div className="p-6 border-t border-white/5 bg-neutral-900/50">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-neutral-950/50 border border-white/5">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs text-neutral-400 font-medium">System Online</span>
                    </div>
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
                                    <h2 className="text-2xl font-bold text-white mb-2">Agent Persona</h2>
                                    <p className="text-neutral-400">Customize how the agent interacts, speaks, and behaves.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm relative group hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <label className="block text-base font-semibold text-white">Personality Matrix</label>
                                                    <p className="text-xs text-neutral-500 mt-1">Demeanor adjustment.</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                                                {settings.personality < 30 ? "STRICT" : settings.personality > 70 ? "CHILL" : "HYBRID"}
                                            </span>
                                        </div>

                                        <div className="relative h-6 flex items-center mb-2">
                                            <div className="absolute w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-linear-to-r from-amber-600 to-amber-400 rounded-full" style={{ width: `${settings.personality}%` }} />
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.personality}
                                                onChange={(e) => setSettings({ ...settings, personality: parseInt(e.target.value) })}
                                                className="w-full h-6 opacity-0 cursor-pointer absolute z-10"
                                            />
                                            <div
                                                className="w-4 h-4 bg-white border-2 border-amber-500 rounded-full shadow-lg absolute pointer-events-none transition-all"
                                                style={{ left: `calc(${settings.personality}% - 8px)` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
                                            <span>Professional</span>
                                            <span>Casual</span>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-sm relative group hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                    <ArrowRight className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <label className="block text-base font-semibold text-white">Response Density</label>
                                                    <p className="text-xs text-neutral-500 mt-1">Detail vs Conciseness.</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-bold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
                                                {settings.responses}%
                                            </span>
                                        </div>

                                        <div className="relative h-6 flex items-center mb-2">
                                            <div className="absolute w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-linear-to-r from-blue-600 to-blue-400 rounded-full" style={{ width: `${settings.responses}%` }} />
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={settings.responses}
                                                onChange={(e) => setSettings({ ...settings, responses: parseInt(e.target.value) })}
                                                className="w-full h-6 opacity-0 cursor-pointer absolute z-10"
                                            />
                                            <div
                                                className="w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-lg absolute pointer-events-none transition-all"
                                                style={{ left: `calc(${settings.responses}% - 8px)` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-medium text-neutral-500 uppercase tracking-wide">
                                            <span>Minimal</span>
                                            <span>Verbose</span>
                                        </div>
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
                                    <div className="border border-white/5 bg-neutral-900/40 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm">

                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                            <div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                                        <Database className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-base font-semibold text-white">Cache Status</h3>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <div className="text-5xl font-bold tracking-tight text-white">
                                                        45.2
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
                                                    <span className="text-emerald-400">45%</span>
                                                </div>
                                                <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-emerald-500 rounded-full w-[45%]" />
                                                </div>
                                            </div>
                                        </div>
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
                    </AnimatePresence>
                </div>

                <div className="h-24 px-12 border-t border-white/5 flex items-center justify-between bg-neutral-900/50 backdrop-blur-xl">
                    <div className="text-xs text-neutral-500 font-medium">
                        <span className="text-neutral-600 mr-2">LAST SAVE</span>
                        Just now
                    </div>
                    <button className="px-6 py-3 bg-amber-500 text-neutral-950 font-bold text-sm rounded-xl hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]">
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </main>
        </div>
    )
}
