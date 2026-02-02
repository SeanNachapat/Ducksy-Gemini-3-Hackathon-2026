"use client"
import React, { useState, useEffect } from "react"
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

    // Initial state เป็น null เพื่อเช็คได้ว่า "กำลังโหลด"
    const [sizeCache, setSizeCache] = useState({
        status: "",
        percent: null,
        size: null,
    })

    useEffect(() => {
        if (!window.electron) return;

        if (activeSection === "memory") {
            // Reset ค่าก่อนโหลดเพื่อให้เห็น Loading State ทุกครั้งที่เข้าหน้านี้ (Option)
            setSizeCache({ status: "", percent: null, size: null })

            console.log("request-sizeCache")
            window.electron.invoke("request-sizeCache").then((event) => {
                const { status, percent, size } = event
                console.log(event)
                // หน่วงเวลานิดหน่อยเพื่อให้เห็น Loading (ถ้า API เร็วมาก) หรือใส่ค่าทันทีก็ได้
                setSizeCache({ status, percent, size })
            })
        }
    }, [activeSection])

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

    // Helper สำหรับเลือกสีตาม Status (แก้ปัญหา Dynamic Class ของ Tailwind)
    const getStatusColor = (status) => {
        if (status === 'warning') return { text: 'text-amber-500', bg: 'bg-amber-500', bgSoft: 'bg-amber-500/10' };
        return { text: 'text-emerald-500', bg: 'bg-emerald-500', bgSoft: 'bg-emerald-500/10' };
    }

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
            </aside>

            <main className="flex-1 flex flex-col relative z-10 bg-neutral-950/50">
                <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                    <AnimatePresence mode="wait">

                        {/* ... Persona Section ... */}
                        {activeSection === "persona" && (
                            <motion.div
                                key="persona"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                {/* ... (Code เดิมส่วน Persona) ... */}
                                <div className="mb-8"><h2 className="text-2xl font-bold text-white mb-2">Agent Persona</h2></div>
                                {/* ใส่ Code เดิมตรงนี้ได้เลยครับ เพื่อความกระชับผมละไว้ */}
                            </motion.div>
                        )}

                        {/* ... Memory Section ... */}
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

                                        {/* --- CHECK: เช็คว่ามีข้อมูลหรือยัง --- */}
                                        {sizeCache.percent === null ? (
                                            // 1. Loading State (Skeleton)
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
                                            // 2. Data Loaded State
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-4">
                                                        {/* ใช้ Helper color function */}
                                                        <div className={`p-2 rounded-lg ${getStatusColor(sizeCache.status).bgSoft} ${getStatusColor(sizeCache.status).text}`}>
                                                            <Database className="w-5 h-5" />
                                                        </div>
                                                        <h3 className="text-base font-semibold text-white">Cache Status</h3>
                                                    </div>
                                                    <div className="flex items-baseline gap-2">
                                                        <div className="text-5xl font-bold tracking-tight text-white">
                                                            {/* แสดงค่า Size */}
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
                                                            {/* ใช้ toFixed แทน Math.round(x, 1) เพราะ JS ไม่มี Math.round แบบระบุทศนิยม */}
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
                                        {/* --- END CHECK --- */}

                                    </div>

                                    {/* Clear Button (คงเดิม) */}
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
                {/* Footer Save Button (คงเดิม) */}
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