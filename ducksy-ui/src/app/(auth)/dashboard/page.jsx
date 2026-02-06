"use client"
import React, { useState, useEffect, useRef } from "react"
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
      HardDrive,
      Calendar,
      Layers,
      SlidersHorizontal,
      X,
      Copy,
      Trash2,
      ExternalLink,
      Loader2,
      RefreshCw
} from "lucide-react"
import Link from "next/link"
import { useSettings } from "@/hooks/SettingsContext"
import { useSessionLogs } from "@/hooks/useSessionLogs"
import Voice from "@/components/Voice"
import MicDevice from "@/components/MicDevice"
import SessionChat from "@/components/SessionChat"
import MediaPreview from "@/components/MediaPreview"

function LiveSystemMetrics() {
      const [metrics, setMetrics] = useState({
            latency: 0,
            tokensUsed: 0,
            tokensTotal: 1000000,
            mcpConnected: false,
            lastUpdated: 0
      })

      useEffect(() => {
            const fetchMetrics = async () => {
                  if (typeof window !== 'undefined' && window.electron) {
                        try {
                              const result = await window.electron.invoke('get-system-metrics')
                              if (result.success && result.data) {
                                    setMetrics(result.data)
                              }
                        } catch (err) {
                              console.error('Failed to fetch metrics:', err)
                        }
                  }
            }

            fetchMetrics()
            const interval = setInterval(fetchMetrics, 3000) 
            return () => clearInterval(interval)
      }, [])

      const formatTokens = (num) => {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
            if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
            return num.toString()
      }

      const isStale = Date.now() - metrics.lastUpdated > 60000

      return (
            <div className="flex items-center gap-3 font-mono text-xs bg-neutral-900/70 px-4 py-2.5 rounded-xl border border-white/5 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                        <span className="text-neutral-500 uppercase tracking-wider text-[10px]">LAT</span>
                        <span className={`font-bold tabular-nums ${metrics.latency === 0 ? 'text-neutral-500' :
                              metrics.latency < 500 ? 'text-green-400' :
                                    metrics.latency < 1000 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                              {metrics.latency === 0 ? '--' : `${metrics.latency}ms`}
                        </span>
                  </div>

                  <span className="w-px h-4 bg-white/10" />

                  <div className="flex items-center gap-2">
                        <span className="text-neutral-500 uppercase tracking-wider text-[10px]">TKN</span>
                        <span className="font-bold tabular-nums">
                              <span className={metrics.tokensUsed > 800000 ? 'text-yellow-400' : 'text-green-400'}>
                                    {formatTokens(metrics.tokensUsed)}
                              </span>
                              <span className="text-neutral-600">/</span>
                              <span className="text-neutral-500">1M</span>
                        </span>
                  </div>

                  <span className="w-px h-4 bg-white/10" />

                  <div className="flex items-center gap-2">
                        <span className="text-neutral-500 uppercase tracking-wider text-[10px]">MCP</span>
                        <div className="flex items-center gap-1.5">
                              <div className={`w-2 h-2 rounded-full ${metrics.mcpConnected
                                    ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse'
                                    : isStale
                                          ? 'bg-neutral-500'
                                          : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                                    }`} />
                              <span className={`font-bold uppercase text-[10px] ${metrics.mcpConnected ? 'text-green-400' : isStale ? 'text-neutral-500' : 'text-red-400'
                                    }`}>
                                    {metrics.mcpConnected ? 'LINK' : isStale ? 'IDLE' : 'ERR'}
                              </span>
                        </div>
                  </div>
            </div>
      )
}


export default function DashboardPage() {
      const [mode, setMode] = useState("lens")
      const [selectedSession, setSelectedSession] = useState(null)
      const [micDevice, setMicDevice] = useState(null)
      const [isDeleting, setIsDeleting] = useState(false)
      const { t } = useSettings()

      const { sessionLogs, isLoading, error, refetch, deleteSession } = useSessionLogs()

      React.useEffect(() => {
            const handleSelection = async (selection) => {
                  if (!selection) return
                  console.log("Received selection:", selection)

                  try {
                        const sources = await window.electron.invoke("get-screen-sources")
                        if (!sources || sources.length === 0) {
                              console.error("No screen sources found")
                              return
                        }
                        const source = sources[0]
                        const stream = await navigator.mediaDevices.getUserMedia({
                              audio: false,
                              video: {
                                    mandatory: {
                                          chromeMediaSource: "desktop",
                                          chromeMediaSourceId: source.id,
                                    },
                              },
                        })

                        console.log("Stream:", stream)

                        const video = document.createElement("video")
                        video.srcObject = stream
                        video.onloadedmetadata = () => {
                              video.play()

                              setTimeout(() => {
                                    const canvas = document.createElement("canvas")
                                    canvas.width = video.videoWidth
                                    canvas.height = video.videoHeight
                                    const ctx = canvas.getContext("2d")
                                    ctx.drawImage(video, 0, 0)

                                    const dataUrl = canvas.toDataURL("image/png")

                                    window.electron.invoke("save-image-file", {
                                          buffer: dataUrl,
                                          mimeType: "image/png",
                                          width: video.videoWidth,
                                          height: video.videoHeight,
                                          title: `Magic Lens Capture`,
                                          selection: selection
                                    })

                                    stream.getTracks().forEach(track => track.stop())
                                    video.remove()
                                    canvas.remove()
                              }, 100)
                        }
                  } catch (err) {
                        console.error("Failed to capture screen selection:", err)
                  }
            }

            if (window.electron) {
                  window.electron.receive("magic-lens-selection", handleSelection)
            }

            return () => {
                  if (window.electron && window.electron.removeAllListeners) {
                        window.electron.removeAllListeners("magic-lens-selection")
                  }
            }
      }, [])



      const modes = [
            { id: "ghost", label: t.modes.ghost, icon: Ghost, description: t.modes.ghostDesc, color: "text-neutral-500", border: "border-neutral-800 bg-neutral-900" },
            { id: "lens", label: t.modes.lens, icon: Eye, description: t.modes.lensDesc, color: "text-amber-400", border: "border-amber-500/50 bg-amber-500/10" },
      ]

      const getAvatarContent = () => {
            switch (mode) {
                  case "ghost":
                        return <span className="text-lg grayscale opacity-50">🦆</span>
                  case "lens":
                        return <span className="text-lg">🦆</span>
                  default:
                        return "🦆"
            }
      }

      const handleDeleteSession = async () => {
            if (!selectedSession || isDeleting) return

            setIsDeleting(true)
            const result = await deleteSession(selectedSession.fileId)

            if (result.success) {
                  setSelectedSession(null)
            } else {
                  console.error("Failed to delete session:", result.error)
            }
            setIsDeleting(false)
      }

      const getStatusBadge = (status) => {
            switch (status) {
                  case 'pending':
                        return (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                    {t.status.pending}
                              </span>
                        )
                  case 'processing':
                        return (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    {t.status.processing}
                              </span>
                        )
                  case 'completed':
                        return (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                                    {t.status.completed}
                              </span>
                        )
                  case 'failed':
                        return (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                    {t.status.failed}
                              </span>
                        )
                  default:
                        return null
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
                                          {t.dashboardPage.configureAgent}
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
                                    <LiveSystemMetrics />

                                    <MicDevice setMicDevice={setMicDevice} micDevice={micDevice} />
                              </div>
                        </header>

                        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

                                    <div className="lg:col-span-4 flex flex-col gap-6">

                                          <motion.button
                                                whileHover={{ scale: 1.01, backgroundColor: "rgb(251 191 36)" }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => {
                                                      if (typeof window !== 'undefined' && window.electron) {
                                                            window.electron.send('open-overlay')
                                                      }
                                                }}
                                                className="group w-full h-36 rounded-3xl bg-amber-500 flex flex-col items-center justify-center relative overflow-hidden transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)] border border-amber-400/20"
                                          >

                                                <div className="relative z-10 flex flex-col items-center gap-3">
                                                      <div className="w-14 h-14 rounded-2xl bg-black/10 flex items-center justify-center text-neutral-950 backdrop-blur-md border border-black/5">
                                                            <Zap className="w-6 h-6 fill-neutral-950" strokeWidth={0} />
                                                      </div>
                                                      <div className="text-center">
                                                            <span className="block text-lg font-bold text-neutral-950 tracking-tight leading-none font-sans">{t.dashboardPage.goInvisible}</span>
                                                            <span className="text-[10px] font-mono text-neutral-900/60 uppercase tracking-[0.2em] mt-1 block">{t.dashboardPage.launchOverlay}</span>
                                                      </div>
                                                </div>
                                          </motion.button>

                                          <div className="bg-neutral-900/40 border border-white/5 rounded-3xl p-6 backdrop-blur-sm flex flex-col gap-6">

                                                <div>
                                                      <div className="flex items-center justify-between mb-4">
                                                            <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{t.dashboardPage.upNext}</h2>
                                                            <Calendar className="w-4 h-4 text-neutral-600" />
                                                      </div>
                                                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:border-amber-500/30 transition-colors">
                                                            <div className="flex items-start justify-between">
                                                                  <div>
                                                                        <div className="text-sm font-medium text-white mb-1">CS Data Structures</div>
                                                                        <div className="text-xs font-mono text-amber-400">14:00 • Today</div>
                                                                  </div>
                                                                  <button className="px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors">
                                                                        {t.session.start}
                                                                  </button>
                                                            </div>
                                                      </div>
                                                </div>

                                                <div>
                                                      <h2 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-4">{t.dashboardPage.quickInputs}</h2>
                                                      <div className="grid grid-cols-3 gap-3">
                                                            <Voice t={t} micDevice={micDevice} mode={mode} onRecordingSaved={refetch} />
                                                            <button className="flex flex-col items-center justify-center gap-2 h-20 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group">
                                                                  <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform text-neutral-400 group-hover:text-white">
                                                                        <Monitor className="w-5 h-5" strokeWidth={1.5} />
                                                                  </div>
                                                                  <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">{t.dashboardPage.camera}</span>
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
                                                            <h2 className="text-lg font-medium text-white tracking-tight">{t.dashboardPage.sessionLog}</h2>
                                                            {isLoading && (
                                                                  <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                                                            )}
                                                      </div>
                                                      <div className="flex items-center gap-2">
                                                            <button
                                                                  onClick={refetch}
                                                                  disabled={isLoading}
                                                                  className="p-2 rounded-full hover:bg-white/5 text-neutral-500 hover:text-white transition-colors disabled:opacity-50"
                                                            >
                                                                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                                            </button>
                                                            <Link href="/sessions">
                                                                  <button className="text-[10px] font-mono font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-[0.2em] border border-white/5 px-3 py-1.5 rounded-full hover:bg-white/5">
                                                                        {t.viewAll}
                                                                  </button>
                                                            </Link>
                                                      </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar z-10 relative">
                                                      {isLoading && sessionLogs.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center h-48">
                                                                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin mb-4" />
                                                                  <p className="text-sm text-neutral-500">{t.session.loading}</p>
                                                            </div>
                                                      ) : error ? (
                                                            <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                                                                  <p className="text-sm mb-3">{t.session.loadFailed}</p>
                                                                  <button
                                                                        onClick={refetch}
                                                                        className="text-xs text-amber-500 hover:underline flex items-center gap-2"
                                                                  >
                                                                        <RefreshCw className="w-3 h-3" />
                                                                        {t.session.tryAgain}
                                                                  </button>
                                                            </div>
                                                      ) : sessionLogs.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                                                                  <FileText className="w-10 h-10 mb-3 opacity-30" />
                                                                  <p className="text-sm font-medium">{t.session.noSessions}</p>
                                                                  <p className="text-xs mt-1 text-neutral-600">{t.session.noSessionsDesc}</p>
                                                            </div>
                                                      ) : (
                                                            sessionLogs.map((log) => (
                                                                  <div
                                                                        key={log.id}
                                                                        onClick={() => setSelectedSession(log)}
                                                                        className="group flex items-center p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 hover:bg-white/[0.05] transition-all cursor-pointer"
                                                                  >
                                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                                                                              ${log.type === 'summary' ? 'bg-blue-500/10 text-blue-400' :
                                                                                    log.type === 'debug' ? 'bg-red-500/10 text-red-400' :
                                                                                          'bg-amber-500/10 text-amber-400'}`}
                                                                        >
                                                                              {log.type === 'summary' && <FileText className="w-4 h-4" strokeWidth={1.5} />}
                                                                              {log.type === 'debug' && <Bug className="w-4 h-4" strokeWidth={1.5} />}
                                                                        </div>

                                                                        <div className="ml-5 flex-1 min-w-0">
                                                                              <h3 className="text-neutral-200 font-medium truncate text-sm">{log.title}</h3>
                                                                              <p className="text-xs text-neutral-500 mt-1 font-medium">{log.subtitle}</p>
                                                                        </div>

                                                                        {/* Status indicator */}
                                                                        {log.transcriptionStatus === 'processing' && (
                                                                              <div className="mr-2">
                                                                                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                                                              </div>
                                                                        )}
                                                                        {log.transcriptionStatus === 'pending' && (
                                                                              <div className="mr-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                                                              </div>
                                                                        )}
                                                                        {log.transcriptionStatus === 'failed' && (
                                                                              <div className="mr-2">
                                                                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                                                              </div>
                                                                        )}

                                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-700 group-hover:text-white transition-all ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transform duration-200">
                                                                              <ChevronRight className="w-4 h-4" />
                                                                        </div>
                                                                  </div>
                                                            ))
                                                      )}
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
                                                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/5">
                                                                  {selectedSession.mode}
                                                            </span>
                                                            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                  {selectedSession.type}
                                                            </span>
                                                            {getStatusBadge(selectedSession.transcriptionStatus)}
                                                      </div>
                                                      <h2 className="text-xl font-bold text-white leading-tight">{selectedSession.title}</h2>
                                                      <p className="text-xs text-neutral-500 mt-1">{selectedSession.subtitle}</p>
                                                      {selectedSession.duration > 0 && (
                                                            <p className="text-xs text-neutral-600 mt-1">
                                                                  {t.session.duration}: {Math.floor(selectedSession.duration / 60)}m {selectedSession.duration % 60}s
                                                            </p>
                                                      )}
                                                </div>
                                                <button
                                                      onClick={() => setSelectedSession(null)}
                                                      className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                                                >
                                                      <X className="w-5 h-5" />
                                                </button>
                                          </div>

                                          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                                                <div className="mb-6">
                                                      <MediaPreview
                                                            fileId={selectedSession.id}
                                                            filePath={selectedSession.filePath}
                                                            mimeType={selectedSession.mimeType}
                                                            duration={selectedSession.duration}
                                                      />
                                                </div>

                                                {selectedSession.transcriptionStatus === 'pending' && (
                                                      <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                                                            <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4">
                                                                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
                                                            </div>
                                                            <p className="text-sm font-medium">{t.session.waiting}</p>
                                                            <p className="text-xs mt-1 text-neutral-600">{t.session.queue}</p>
                                                      </div>
                                                )}

                                                {selectedSession.transcriptionStatus === 'processing' && (
                                                      <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                                                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                                            <p className="text-sm font-medium">{t.status.processing}...</p>
                                                            <p className="text-xs mt-1 text-neutral-600">{t.session.analyzing}</p>
                                                      </div>
                                                )}

                                                {selectedSession.transcriptionStatus === 'failed' && (
                                                      <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                                                            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                                                  <X className="w-6 h-6 text-red-500" />
                                                            </div>
                                                            <p className="text-sm font-medium text-red-400">{t.session.failedTitle}</p>
                                                            <p className="text-xs mt-1 text-neutral-600 mb-4">{t.session.failedDesc}</p>
                                                            <button
                                                                  onClick={async () => {
                                                                        if (window.electron && selectedSession) {
                                                                              try {
                                                                                    const result = await window.electron.invoke('retry-transcription', {
                                                                                          fileId: selectedSession.fileId || selectedSession.id
                                                                                    })
                                                                                    if (result.success) {
                                                                                          setSelectedSession(prev => ({
                                                                                                ...prev,
                                                                                                transcriptionStatus: 'processing'
                                                                                          }))
                                                                                          refetch()
                                                                                    }
                                                                              } catch (e) {
                                                                                    console.error("Retry failed:", e)
                                                                              }
                                                                        }
                                                                  }}
                                                                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 transition-colors"
                                                            >
                                                                  <RefreshCw className="w-4 h-4" />
                                                                  {t.session?.retryAnalysis || "Retry Analysis"}
                                                            </button>
                                                      </div>
                                                )}

                                                {selectedSession.transcriptionStatus === 'completed' && (
                                                      <>
                                                            {selectedSession.type === 'summary' && (
                                                                  <div className="space-y-6">
                                                                        <div>
                                                                              <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-3">{t.dashboardPage.meetingTopic}</h4>
                                                                              <p className="text-neutral-300 leading-relaxed font-light">{selectedSession.details.topic}</p>
                                                                        </div>
                                                                        <div>
                                                                              <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-3">{t.dashboardPage.summary}</h4>
                                                                              <p className="text-neutral-300 leading-relaxed font-light">{selectedSession.details.summary}</p>
                                                                        </div>
                                                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                                              <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">{t.dashboardPage.actionItems}</h4>
                                                                              <ul className="space-y-2">
                                                                                    {selectedSession.details.actionItems?.map((item, i) => {
                                                                                          const isObject = typeof item === 'object' && item !== null;
                                                                                          const text = isObject ? item.description : item;
                                                                                          const tool = isObject ? item.tool : null;
                                                                                          const params = isObject ? item.parameters : {};

                                                                                          return (
                                                                                                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300 bg-black/20 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                                                                                                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                                                                                                      <div className="flex-1">
                                                                                                            <p className="leading-relaxed">{text}</p>
                                                                                                            {tool && (
                                                                                                                  <div className="mt-2 flex gap-2">
                                                                                                                        <button
                                                                                                                              onClick={(e) => {
                                                                                                                                    e.stopPropagation();
                                                                                                                                    if (window.electron) {
                                                                                                                                          window.electron.invoke('execute-tool', { tool, params })
                                                                                                                                                .then(res => {
                                                                                                                                                      if (res.success) alert("Action Executed!");
                                                                                                                                                      else alert("Error: " + res.error);
                                                                                                                                                });
                                                                                                                                    }
                                                                                                                              }}
                                                                                                                              className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-medium rounded-md transition-colors border border-amber-500/20 flex items-center gap-2"
                                                                                                                        >
                                                                                                                              <Zap className="w-3 h-3" />
                                                                                                                              Execute
                                                                                                                        </button>
                                                                                                                  </div>
                                                                                                            )}
                                                                                                      </div>
                                                                                                </li>
                                                                                          );
                                                                                    })}
                                                                                    {(!selectedSession.details.actionItems || selectedSession.details.actionItems.length === 0) && (
                                                                                          <li className="text-sm text-neutral-500 italic">{t.dashboardPage.noActionItems}</li>
                                                                                    )}
                                                                              </ul>
                                                                        </div>
                                                                  </div>
                                                            )}

                                                            {selectedSession.type === 'debug' && (
                                                                  <div className="space-y-6">
                                                                        <div>
                                                                              <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                                    <Bug className="w-3 h-3" /> {t.dashboardPage.reportedBug}
                                                                              </h4>
                                                                              <p className="text-white font-mono text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                                                    {selectedSession.details.bug}
                                                                              </p>
                                                                        </div>
                                                                        <div>
                                                                              <h4 className="text-xs font-mono text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                                                    <Zap className="w-3 h-3" /> {t.dashboardPage.solutionApplied}
                                                                              </h4>
                                                                              <p className="text-neutral-300 text-sm leading-relaxed">
                                                                                    {selectedSession.details.fix}
                                                                              </p>
                                                                        </div>
                                                                        {selectedSession.details.code && (
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
                                                                        )}
                                                                  </div>
                                                            )}


                                                      </>
                                                )}
                                                <div className="mt-8 pt-6 border-t border-white/5">
                                                      <SessionChat
                                                            fileId={selectedSession.id}
                                                            initialHistory={selectedSession.chatHistory || []}
                                                      />
                                                </div>
                                          </div>

                                          <div className="p-6 border-t border-white/5 bg-neutral-900/30 flex gap-3">
                                                <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 hover:text-white text-neutral-300 transition-colors flex items-center justify-center gap-2">
                                                      <ExternalLink className="w-4 h-4" /> {t.dashboardPage.openOverlay}
                                                </button>
                                                <button
                                                      onClick={async () => {
                                                            if (window.electron && selectedSession) {
                                                                  const result = await window.electron.invoke('get-session', { fileId: selectedSession.fileId || selectedSession.id })
                                                                  if (result.success && result.data) {
                                                                        setSelectedSession(result.data)
                                                                  }
                                                                  refetch()
                                                            }
                                                      }}
                                                      className="py-3 px-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-colors"
                                                      title={t.sessionsPage?.refresh || "Refresh"}
                                                >
                                                      <RefreshCw className="w-4 h-4" />
                                                </button>
                                                <button
                                                      onClick={handleDeleteSession}
                                                      disabled={isDeleting}
                                                      className="py-3 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                      {isDeleting ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                      ) : (
                                                            <Trash2 className="w-4 h-4" />
                                                      )}
                                                </button>
                                          </div>

                                    </motion.div>
                              </>
                        )}
                  </AnimatePresence>

            </div >
      )
}