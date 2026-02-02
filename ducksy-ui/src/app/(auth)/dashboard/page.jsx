"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
      Mic,
      Monitor,
      Camera,
      FileText,
      Bug,
      MessageSquare,
      ChevronRight,
      Activity,
      Zap,
      Ghost,
      Eye,
      GraduationCap,
      HardDrive,
      Calendar,
      Layers,
      SlidersHorizontal,
      X,
      Copy,
      Trash2,
      ExternalLink
} from "lucide-react"
import Link from "next/link"

const sessionLog = [
      {
            id: 1,
            type: "summary",
            title: "CS Lecture Intro",
            subtitle: "Meeting Summary • 2h ago",
            mode: "Ghost Mode 👻",
            details: {
                  topic: "CS Lecture Intro",
                  summary: "Professor discussed the syllabus and Big O notation.",
                  actionItems: [
                        "Read Ch. 1 by Monday",
                        "Install Java JDK",
                        "Join Discord server"
                  ]
            }
      },
      {
            id: 2,
            type: "debug",
            title: "Fixing Python Line 42",
            subtitle: "Debug Session • 4h ago",
            mode: "Coach Mode 🎓",
            details: {
                  bug: "TypeError: null is not an object",
                  fix: "Added a null check on line 42.",
                  code: `if (data) {
  processData(data);
} else {
  console.warn("Data is null");
}`
            }
      },
      {
            id: 3,
            type: "chat",
            title: "Explain Quantum Computing",
            subtitle: "Standard Chat • 5h ago",
            mode: "Lens Mode 🕶️",
            details: {
                  question: "Explain Quantum Computing like I'm 5",
                  answer: "Imagine a coin spinning on a table. While it's spinning, it's kind of both Heads and Tails at the same time. That's a Qubit! Regular computers are like a coin that has stopped (just Heads or Tails)."
            }
      },
      { id: 4, type: "summary", title: "Weekly Team Sync", subtitle: "Meeting Summary • Yesterday", mode: "Ghost Mode 👻", details: { topic: "Weekly Sync", summary: "Team aligned on Q3 goals.", actionItems: [] } },
      { id: 5, type: "chat", title: "React Component Help", subtitle: "Standard Chat • Yesterday", mode: "Coach Mode 🎓", details: { question: "How to use useEffect?", answer: "It runs after render. Use dependency array to control when it runs." } },
]

export default function DashboardPage() {
      const [mode, setMode] = useState("lens")
      const [selectedSession, setSelectedSession] = useState(null)

      const modes = [
            { id: "ghost", label: "Ghost", icon: Ghost, description: "Monitoring", color: "text-neutral-500", border: "border-neutral-800 bg-neutral-900" },
            { id: "lens", label: "Lens", icon: Eye, description: "Ready to Capture", color: "text-amber-400", border: "border-amber-500/50 bg-amber-500/10" },
            { id: "coach", label: "Coach", icon: GraduationCap, description: "Proactive Teaching", color: "text-amber-400", border: "border-amber-500/50 bg-amber-500/10" },
      ]

      const getAvatarContent = () => {
            switch (mode) {
                  case "ghost":
                        return <span className="text-lg grayscale opacity-50">🦆</span>
                  case "lens":
                        return <span className="text-lg">🦆</span>
                  case "coach":
                        return <span className="text-lg">🦆</span>
                  default:
                        return "🦆"
            }
      }

      return (
            <div className="flex h-full w-full relative bg-neutral-950 text-white font-sans overflow-hidden selection:bg-amber-500/30">

                  <div className="absolute inset-0 bg-linear-to-b from-neutral-900 via-neutral-950 to-black pointer-events-none z-0" />
                  <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
                  <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-400/3 blur-[100px] rounded-full pointer-events-none z-0" />

                  <aside className="w-20 border-r border-white/5 flex flex-col items-center py-6 z-20 bg-neutral-900/30 backdrop-blur-md">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 hover:bg-white/10 transition-colors cursor-pointer group">
                              <Layers className="w-5 h-5 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                        </div>

                        <div className="mt-auto flex flex-col gap-6 items-center pb-6">
                              <div className="relative group flex items-center justify-center">
                                    <Link href="/configure">
                                          <button
                                                className="w-10 h-10 rounded-full bg-transparent border border-white/10 flex items-center justify-center text-neutral-500 hover:text-amber-400 hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-all duration-300 group-hover:scale-105"
                                                aria-label="Configure Agent"
                                          >
                                                <SlidersHorizontal className="w-5 h-5" strokeWidth={1.5} />
                                          </button>
                                    </Link>

                                    <span className="absolute left-full ml-4 px-2 py-1 bg-neutral-900 border border-white/10 rounded-md text-xs text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md z-50">
                                          Configure Agent
                                    </span>
                              </div>
                        </div>
                  </aside>

                  <main className="flex-1 flex flex-col relative overflow-hidden z-10 transition-all duration-300">

                        <header className="h-24 px-8 flex items-center justify-between border-b border-white/5 bg-neutral-950/50 backdrop-blur-xl">
                              <div className="flex items-center bg-neutral-900/50 rounded-full p-1 border border-white/5">
                                    {modes.map((m) => {
                                          const isActive = mode === m.id
                                          const Icon = m.icon
                                          const activeColor = "text-amber-400"
                                          const activeBg = "bg-neutral-800/80 border border-white/5 shadow-sm"

                                          return (
                                                <button
                                                      key={m.id}
                                                      onClick={() => setMode(m.id)}
                                                      className={`
                                relative flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                                ${isActive ? "" : "hover:bg-white/5"}
                            `}
                                                >
                                                      <span className="relative z-10 flex items-center gap-2">
                                                            <Icon className={`w-4 h-4 ${isActive ? activeColor : "text-neutral-500"}`} strokeWidth={2} />
                                                            <span className={`text-sm font-medium ${isActive ? "text-white" : "text-neutral-500"}`}>
                                                                  {m.label}
                                                            </span>
                                                      </span>

                                                      {isActive && (
                                                            <motion.div
                                                                  layoutId="activeMode"
                                                                  className={`absolute inset-0 rounded-full ${activeBg}`}
                                                                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                            />
                                                      )}
                                                </button>
                                          )
                                    })}
                              </div>

                              <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 bg-neutral-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                                          <span className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                Local Files
                                          </span>
                                          <span className="w-px h-3 bg-white/10" />
                                          <span className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-rose-500/50" />
                                                G-Calendar
                                          </span>
                                    </div>

                                    <div className="flex items-center gap-3 pl-6 border-l border-white/5">
                                          <div className="text-right hidden sm:block">
                                                <div className="text-sm font-medium text-neutral-200">Commander</div>
                                                <div className="text-xs text-neutral-500 font-mono tracking-wide">ONLINE</div>
                                          </div>
                                          <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-neutral-950 font-bold text-sm ring-2 ring-neutral-950 shadow-lg transition-all duration-300 relative overflow-hidden">
                                                <div className="absolute inset-0 bg-linear-to-tr from-transparent to-white/20" />
                                                {getAvatarContent()}
                                          </div>
                                    </div>
                              </div>
                        </header>

                        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                                    <div className="lg:col-span-4 flex flex-col gap-6">

                                          <motion.button
                                                whileHover={{ scale: 1.01, backgroundColor: "rgb(251 191 36)" }}
                                                whileTap={{ scale: 0.99 }}
                                                className="group w-full h-36 rounded-3xl bg-amber-500 flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] border border-amber-400/20"
                                          >

                                                <div className="relative z-10 flex flex-col items-center gap-3">
                                                      <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center text-neutral-950 backdrop-blur-md border border-black/5">
                                                            <Zap className="w-6 h-6 fill-neutral-950" strokeWidth={0} />
                                                      </div>
                                                      <div className="text-center">
                                                            <span className="block text-lg font-bold text-neutral-950 tracking-tight leading-none font-sans">GO INVISIBLE</span>
                                                            <span className="text-[10px] font-mono text-neutral-900/60 uppercase tracking-[0.2em] mt-1 block">Launch Overlay</span>
                                                      </div>
                                                </div>
                                          </motion.button>

                                          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-6">

                                                <div>
                                                      <div className="flex items-center justify-between mb-4">
                                                            <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">Up Next</h2>
                                                            <Calendar className="w-4 h-4 text-neutral-600" />
                                                      </div>
                                                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:border-amber-500/30 transition-colors">
                                                            <div className="flex items-start justify-between">
                                                                  <div>
                                                                        <div className="text-sm font-medium text-white mb-1">CS Data Structures</div>
                                                                        <div className="text-xs font-mono text-amber-400">14:00 • Today</div>
                                                                  </div>
                                                                  <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors">
                                                                        Start
                                                                  </button>
                                                            </div>
                                                      </div>
                                                </div>

                                                <div>
                                                      <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">Quick Inputs</h2>
                                                      <div className="grid grid-cols-3 gap-3">
                                                            <button className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                                                                  <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform text-neutral-400 group-hover:text-white">
                                                                        <Mic className="w-5 h-5" strokeWidth={1.5} />
                                                                  </div>
                                                                  <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">Voice</span>
                                                            </button>

                                                            <button className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                                                                  <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform text-neutral-400 group-hover:text-white">
                                                                        <Monitor className="w-5 h-5" strokeWidth={1.5} />
                                                                  </div>
                                                                  <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">Screen</span>
                                                            </button>

                                                            <button className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                                                                  <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform text-neutral-400 group-hover:text-white">
                                                                        <Camera className="w-5 h-5" strokeWidth={1.5} />
                                                                  </div>
                                                                  <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">Camera</span>
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>

                                    </div>

                                    <div className="lg:col-span-8 flex flex-col h-full overflow-hidden">
                                          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-8 flex-1 flex flex-col backdrop-blur-sm relative overflow-hidden">
                                                <div className="flex items-center justify-between mb-8 z-10 relative">
                                                      <div className="flex items-center gap-3">
                                                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                                                  <Activity className="w-4 h-4" />
                                                            </div>
                                                            <h2 className="text-lg font-medium text-white tracking-tight">Session Log</h2>
                                                      </div>
                                                      <button className="text-[10px] font-mono font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-[0.2em] border border-white/5 px-3 py-1.5 rounded-full hover:bg-white/5">
                                                            VIEW ALL
                                                      </button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar z-10 relative">
                                                      {sessionLog.map((log) => (
                                                            <div
                                                                  key={log.id}
                                                                  onClick={() => setSelectedSession(log)}
                                                                  className="group flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer"
                                                            >
                                                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 
                                                                        ${log.type === 'summary' ? 'bg-blue-500/10 text-blue-400' :
                                                                              log.type === 'debug' ? 'bg-red-500/10 text-red-400' :
                                                                                    'bg-amber-500/10 text-amber-400'}`}
                                                                  >
                                                                        {log.type === 'summary' && <FileText className="w-4 h-4" strokeWidth={1.5} />}
                                                                        {log.type === 'debug' && <Bug className="w-4 h-4" strokeWidth={1.5} />}
                                                                        {log.type === 'chat' && <MessageSquare className="w-4 h-4" strokeWidth={1.5} />}
                                                                  </div>

                                                                  <div className="ml-5 flex-1 min-w-0">
                                                                        <h3 className="text-neutral-200 font-medium truncate text-sm">{log.title}</h3>
                                                                        <p className="text-xs text-neutral-500 mt-1 font-medium">{log.subtitle}</p>
                                                                  </div>

                                                                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 group-hover:text-white transition-all ml-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transform duration-200">
                                                                        <ChevronRight className="w-4 h-4" />
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>

                                                <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-neutral-950/80 to-transparent pointer-events-none" />
                                          </div>
                                    </div>

                              </div>
                        </div>
                  </main>

                  <AnimatePresence>
                        {selectedSession && (
                              <>
                                    <motion.div
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          onClick={() => setSelectedSession(null)}
                                          className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
                                    />

                                    <motion.div
                                          initial={{ x: "100%" }}
                                          animate={{ x: 0 }}
                                          exit={{ x: "100%" }}
                                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                          className="absolute top-0 right-0 h-full w-full md:w-1/3 min-w-[350px] bg-neutral-950/95 backdrop-blur-xl border-l border-white/10 z-50 shadow-2xl overflow-hidden flex flex-col"
                                    >
                                          <div className="p-6 border-b border-white/5 flex items-start justify-between bg-neutral-900/30">
                                                <div>
                                                      <div className="flex items-center gap-2 mb-2">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/5">
                                                                  {selectedSession.mode}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                  {selectedSession.type}
                                                            </span>
                                                      </div>
                                                      <h2 className="text-xl font-bold text-white leading-tight">{selectedSession.title}</h2>
                                                      <p className="text-xs text-neutral-500 mt-1">{selectedSession.subtitle}</p>
                                                </div>
                                                <button
                                                      onClick={() => setSelectedSession(null)}
                                                      className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                                                >
                                                      <X className="w-5 h-5" />
                                                </button>
                                          </div>

                                          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                                {selectedSession.type === 'summary' && (
                                                      <div className="space-y-6">
                                                            <div>
                                                                  <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-3">Meeting Topic</h4>
                                                                  <p className="text-neutral-300 leading-relaxed font-light">{selectedSession.details.topic}</p>
                                                            </div>
                                                            <div>
                                                                  <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-3">Summary</h4>
                                                                  <p className="text-neutral-300 leading-relaxed font-light">{selectedSession.details.summary}</p>
                                                            </div>
                                                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                                  <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">Action Items</h4>
                                                                  <ul className="space-y-2">
                                                                        {selectedSession.details.actionItems?.map((item, i) => (
                                                                              <li key={i} className="flex items-center gap-2 text-sm text-neutral-300">
                                                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                                                                                    {item}
                                                                              </li>
                                                                        ))}
                                                                        {(!selectedSession.details.actionItems || selectedSession.details.actionItems.length === 0) && (
                                                                              <li className="text-sm text-neutral-500 italic">No action items recorded.</li>
                                                                        )}
                                                                  </ul>
                                                            </div>
                                                      </div>
                                                )}

                                                {selectedSession.type === 'debug' && (
                                                      <div className="space-y-6">
                                                            <div>
                                                                  <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                        <Bug className="w-3 h-3" /> Reported Bug
                                                                  </h4>
                                                                  <p className="text-white font-mono text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                                        {selectedSession.details.bug}
                                                                  </p>
                                                            </div>
                                                            <div>
                                                                  <h4 className="text-xs font-mono text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                        <Zap className="w-3 h-3" /> Solution applied
                                                                  </h4>
                                                                  <p className="text-neutral-300 text-sm leading-relaxed">
                                                                        {selectedSession.details.fix}
                                                                  </p>
                                                            </div>
                                                            <div className="relative group">
                                                                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors">
                                                                              <Copy className="w-3 h-3" />
                                                                        </button>
                                                                  </div>
                                                                  <pre className="bg-[#0d1117] p-4 rounded-xl border border-white/10 text-xs font-mono text-neutral-300 overflow-x-auto">
                                                                        <code>{selectedSession.details.code}</code>
                                                                  </pre>
                                                            </div>
                                                      </div>
                                                )}

                                                {selectedSession.type === 'chat' && (
                                                      <div className="space-y-6">
                                                            <div className="flex gap-4">
                                                                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 border border-white/5">
                                                                        <span className="text-xs">You</span>
                                                                  </div>
                                                                  <div className="bg-neutral-900 rounded-2xl rounded-tl-none p-4 border border-white/5 text-sm text-neutral-300 leading-relaxed max-w-[85%]">
                                                                        {selectedSession.details.question}
                                                                  </div>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                  <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shrink-0 text-black font-bold text-xs ring-2 ring-neutral-950">
                                                                        D
                                                                  </div>
                                                                  <div className="bg-amber-500/10 rounded-2xl rounded-tl-none p-4 border border-amber-500/10 text-sm text-neutral-200 leading-relaxed max-w-[85%]">
                                                                        {selectedSession.details.answer}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                )}
                                          </div>

                                          <div className="p-6 border-t border-white/5 bg-neutral-900/30 flex gap-3">
                                                <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 hover:text-white text-neutral-300 transition-colors flex items-center justify-center gap-2">
                                                      <ExternalLink className="w-4 h-4" /> Open Overlay
                                                </button>
                                                <button className="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors">
                                                      <Trash2 className="w-4 h-4" />
                                                </button>
                                          </div>

                                    </motion.div>
                              </>
                        )}
                  </AnimatePresence>

            </div>
      )
}