"use client"
import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FileText,
    Bug,
    ChevronRight,
    Activity,
    Zap,
    Layers,
    X,
    Copy,
    Trash2,
    ExternalLink,
    Loader2,
    RefreshCw,
    ArrowLeft,
    Search,
    Filter,
    Calendar,
    Clock,
    Image,
    Plus
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSettings } from "@/hooks/SettingsContext"
import { useSessionLogs } from "@/hooks/useSessionLogs"
import SessionChat from "@/components/SessionChat"
import MediaPreview from "@/components/MediaPreview"
import EditableEventModal from "@/components/EditableEventModal"
import ThinkingIndicator from "@/components/ThinkingIndicator"

export default function SessionsPage() {
    const router = useRouter()
    const [selectedSession, setSelectedSession] = useState(null)
    const [logoAnimation, setLogoAnimation] = useState("");
    const [animKey, setAnimKey] = useState(0);

    const triggerLogoAnimation = (e) => {
        // Pick a random animation
        const animations = ["spin", "bounce", "shake", "pulse"];
        const randomAnim = animations[Math.floor(Math.random() * animations.length)];
        setLogoAnimation(randomAnim);
        setAnimKey(prev => prev + 1);

        // Navigate home after delay
        setTimeout(() => {
            router.push('/dashboard');
        }, 400);

        // Reset after duration
        setTimeout(() => setLogoAnimation(""), 1000);
    };
    const [isDeleting, setIsDeleting] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState("all")
    const [editingEvent, setEditingEvent] = useState(null)
    const { t, settings } = useSettings()

    const { sessionLogs, isLoading, error, refetch, deleteSession } = useSessionLogs()

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

    const handleRefreshSession = async () => {
        if (!selectedSession || isRefreshing) return

        setIsRefreshing(true)
        try {
            if (window.electron) {
                const result = await window.electron.invoke('retry-transcription', {
                    fileId: selectedSession.fileId,
                    userLanguage: settings?.language || 'en',
                    settings: settings || {}
                })
                if (result.success) {
                    setSelectedSession(prev => ({
                        ...prev,
                        transcriptionStatus: 'processing'
                    }))
                    refetch()
                } else {
                    console.error("Failed to refresh session:", result.error)
                }
            }
        } catch (err) {
            console.error("Failed to refresh session:", err)
        } finally {
            setIsRefreshing(false)
        }
    }

    React.useEffect(() => {
        if (!window.electron) return;

        const handleTranscriptionUpdate = (event, data) => {
            if (selectedSession && (data.fileId === selectedSession.fileId || data.fileId === selectedSession.id)) {
                // If the update contains details, we can update local state directly for immediate feedback
                if (data.details) {
                    setSelectedSession(prev => ({
                        ...prev,
                        details: data.details
                    }));
                }
                refetch();
            }
        };

        window.electron.receive('transcription-updated', handleTranscriptionUpdate);

        return () => {
            if (window.electron.removeAllListeners) {
                window.electron.removeAllListeners('transcription-updated');
            }
        };
    }, [selectedSession, refetch]);

    const filteredSessions = sessionLogs.filter(log => {
        const matchesSearch = log.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesFilter = filterType === "all" || log.type === filterType
        return matchesSearch && matchesFilter
    })

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        {t.status?.pending || "Pending"}
                    </span>
                )
            case 'processing':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        {t.status?.processing || "Processing"}
                    </span>
                )
            case 'completed':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                        {t.status?.completed || "Completed"}
                    </span>
                )
            case 'failed':
                return (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                        {t.status?.failed || "Failed"}
                    </span>
                )
            default:
                return null
        }
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'summary':
                return <FileText className="w-5 h-5" strokeWidth={1.5} />
            case 'debug':
                return <Bug className="w-5 h-5" strokeWidth={1.5} />
            case 'image':
                return <Image className="w-5 h-5" strokeWidth={1.5} />
            default:
                return <FileText className="w-5 h-5" strokeWidth={1.5} />
        }
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'summary':
                return 'bg-blue-500/10 text-blue-400'
            case 'debug':
                return 'bg-red-500/10 text-red-400'
            case 'image':
                return 'bg-purple-500/10 text-purple-400'
            default:
                return 'bg-amber-500/10 text-amber-400'
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return ""

        let parsedDate = dateString
        if (!dateString.includes('Z') && !dateString.includes('+') && !dateString.includes('-', 10)) {
            parsedDate = dateString.replace(' ', 'T') + 'Z'
        }
        const date = new Date(parsedDate)
        const now = new Date()
        const diff = now - date

        const minutes = Math.floor(diff / (1000 * 60))
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))

        if (minutes < 1) return t.sessionsPage?.justNow || "Just now"
        if (minutes < 60) return `${minutes} ${minutes === 1 ? (t.sessionsPage?.minuteAgo || "minute ago") : (t.sessionsPage?.minutesAgo || "minutes ago")}`
        if (hours < 24) return `${hours} ${hours === 1 ? (t.sessionsPage?.hourAgo || "hour ago") : (t.sessionsPage?.hoursAgo || "hours ago")}`
        if (days === 1) return t.yesterday || "Yesterday"
        if (days < 7) return `${days} ${t.sessionsPage?.daysAgo || "days ago"}`
        return date.toLocaleDateString()
    }

    return (
        <div className="flex h-full w-full relative bg-neutral-950 text-white font-sans overflow-hidden selection:bg-amber-500/30">
            <div className="absolute inset-0 bg-linear-to-b from-neutral-900 via-neutral-950 to-black pointer-events-none z-0" />
            <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-400/3 blur-[100px] rounded-full pointer-events-none z-0" />

            <aside className="w-20 border-r border-white/5 flex flex-col items-center py-6 z-20 bg-neutral-900/30 backdrop-blur-md">
                <div onClick={triggerLogoAnimation} className="mb-8 group cursor-pointer">
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/10 flex items-center justify-center hover:bg-amber-500/20 hover:border-amber-500/30 transition-all duration-500 shadow-[0_0_20px_rgba(251,191,36,0.05)] group-hover:shadow-[0_0_25px_rgba(251,191,36,0.15)] group-hover:scale-105 overflow-hidden p-2">
                        <motion.div
                            key={animKey}
                            animate={
                                logoAnimation === "spin" ? { rotate: 360 } :
                                    logoAnimation === "bounce" ? { y: [0, -12, 0, -6, 0] } :
                                        logoAnimation === "shake" ? { x: [0, -5, 5, -5, 5, 0] } :
                                            logoAnimation === "pulse" ? { scale: [1, 1.3, 1] } :
                                                { rotate: 0, y: 0, x: 0, scale: 1 }
                            }
                            transition={{
                                duration: logoAnimation === "pulse" ? 0.3 : 0.6,
                                ease: "easeInOut"
                            }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <img src="/ducksy-logo.svg" alt="Ducksy Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(251,191,36,0.3)] group-hover:brightness-110 transition-all pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden z-10">
                <header className="h-20 px-8 flex items-center justify-between border-b border-white/5 bg-neutral-950/50 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <button className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                                <ArrowLeft className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                            </button>
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-tight">
                                    {t.sessionsPage?.title || "All Sessions"}
                                </h1>
                                <p className="text-xs text-neutral-500">
                                    {filteredSessions.length} {t.sessionsPage?.sessionsFound || "sessions found"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                            <input
                                type="text"
                                placeholder={t.sessionsPage?.searchPlaceholder || "Search sessions..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-64 bg-white/5 border border-white/5 rounded-xl text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all"
                            />
                        </div>

                        <div className="flex items-center gap-1 bg-neutral-900/50 rounded-xl p-1 border border-white/5">
                            {["all", "summary", "debug"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === type
                                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                        : "text-neutral-500 hover:text-white hover:bg-white/5"
                                        }`}
                                >
                                    {type === "all" ? (t.sessionsPage?.filterAll || "All") :
                                        type === "summary" ? (t.sessionsPage?.filterSummary || "Summary") :
                                            (t.sessionsPage?.filterDebug || "Debug")}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={refetch}
                            disabled={isLoading}
                            className="p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                    {isLoading && sessionLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64">
                            <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                            <p className="text-sm text-neutral-500">{t.session?.loading || "Loading sessions..."}</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                            <p className="text-sm mb-3">{t.session?.loadFailed || "Failed to load sessions"}</p>
                            <button
                                onClick={refetch}
                                className="text-xs text-amber-500 hover:underline flex items-center gap-2"
                            >
                                <RefreshCw className="w-3 h-3" />
                                {t.session?.tryAgain || "Try again"}
                            </button>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-neutral-500">
                            <FileText className="w-12 h-12 mb-3 opacity-30" />
                            <p className="text-sm font-medium">{t.session?.noSessions || "No sessions yet"}</p>
                            <p className="text-xs mt-1 text-neutral-600">{t.session?.noSessionsDesc || "Start recording to see your sessions here"}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredSessions.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    onClick={() => setSelectedSession(log)}
                                    className="group p-5 rounded-2xl bg-neutral-900/40 border border-white/5 hover:border-amber-500/30 hover:bg-neutral-900/60 transition-all cursor-pointer backdrop-blur-sm"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeColor(log.type)}`}>
                                            {getTypeIcon(log.type)}
                                        </div>
                                        {getStatusBadge(log.transcriptionStatus)}
                                    </div>

                                    <h3 className="text-white font-medium mb-1 line-clamp-1 group-hover:text-amber-400 transition-colors">
                                        {log.title}
                                    </h3>
                                    <p className="text-xs text-neutral-500 mb-4 line-clamp-2">
                                        {log.subtitle}
                                    </p>

                                    <div className="flex items-center justify-between text-xs text-neutral-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(log.timestamp || log.createdAt)}</span>
                                        </div>
                                        {log.duration && (
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3 h-3" />
                                                <span>{Math.floor(log.duration / 60)}m {log.duration % 60}s</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs text-amber-500 font-medium">
                                            {t.sessionsPage?.viewDetails || "View Details"}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-amber-500" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
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
                            className="absolute top-0 right-0 h-full w-full md:w-2/5 min-w-[400px] bg-neutral-950/95 backdrop-blur-xl border-l border-white/10 z-50 shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-6 border-b border-white/5 flex items-start justify-between bg-neutral-900/30">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                            {selectedSession.type}
                                        </span>
                                        {getStatusBadge(selectedSession.transcriptionStatus)}
                                    </div>
                                    <h2 className="text-xl font-bold text-white leading-tight">{selectedSession.title}</h2>
                                    <p className="text-xs text-neutral-500 mt-1">{selectedSession.subtitle}</p>
                                    {selectedSession.duration > 0 && (
                                        <p className="text-xs text-neutral-600 mt-1">
                                            {t.session?.duration || "Duration"}: {Math.floor(selectedSession.duration / 60)}m {selectedSession.duration % 60}s
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
                                        <p className="text-sm font-medium">{t.session?.waiting || "Waiting to process"}</p>
                                        <p className="text-xs mt-1 text-neutral-600">{t.session?.queue || "This recording is in queue"}</p>
                                    </div>
                                )}

                                {selectedSession.transcriptionStatus === 'processing' && (
                                    <div className="flex flex-col items-center justify-center h-64 w-full">
                                        <ThinkingIndicator type={selectedSession.mimeType?.startsWith('image') ? 'image' : 'audio'} />
                                    </div>
                                )}

                                {selectedSession.transcriptionStatus === 'failed' && (
                                    <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                            <X className="w-6 h-6 text-red-500" />
                                        </div>
                                        <p className="text-sm font-medium text-red-400">{t.session?.failedTitle || "Processing failed"}</p>
                                        <p className="text-xs mt-1 text-neutral-600 mb-4">{t.session?.failedDesc || "There was an error processing this recording"}</p>
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
                                                    <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-3">{t.dashboardPage?.meetingTopic || "Meeting Topic"}</h4>
                                                    <p className="text-neutral-300 leading-relaxed font-light">{selectedSession.details?.topic}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-3">{t.dashboardPage?.summary || "Summary"}</h4>
                                                    <p className="text-neutral-300 leading-relaxed font-light">{selectedSession.details?.summary}</p>
                                                </div>
                                                <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                                    <h4 className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-3">{t.dashboardPage?.actionItems || "Action Items"}</h4>
                                                    <ul className="space-y-2">
                                                        {(() => {
                                                            const items = selectedSession.details?.actionItems || [];
                                                            const sortedItems = [...items].sort((a, b) => {
                                                                const getStatus = (item) => {
                                                                    const isPast = item.calendarEvent?.dateTime && new Date(item.calendarEvent.dateTime) < new Date();
                                                                    const isDismissed = item.dismissed;
                                                                    return (isDismissed || isPast) ? 1 : 0;
                                                                };
                                                                const statusA = getStatus(a);
                                                                const statusB = getStatus(b);
                                                                if (statusA !== statusB) return statusA - statusB;
                                                                const dateA = a.calendarEvent?.dateTime ? new Date(a.calendarEvent.dateTime) : new Date(8640000000000000);
                                                                const dateB = b.calendarEvent?.dateTime ? new Date(b.calendarEvent.dateTime) : new Date(8640000000000000);
                                                                return dateA - dateB;
                                                            });

                                                            return sortedItems.map((item, i) => {
                                                                const originalIndex = items.indexOf(item);
                                                                const isObject = typeof item === 'object' && item !== null;
                                                                const text = isObject ? item.description : item;
                                                                const tool = isObject ? item.tool : null;

                                                                const isPast = item.calendarEvent?.dateTime && new Date(item.calendarEvent.dateTime) < new Date();
                                                                const isInactive = item?.dismissed || isPast;

                                                                return (
                                                                    <li key={originalIndex} className={`flex items-start gap-3 text-sm text-neutral-300 bg-black/20 p-3 rounded-lg border border-white/5 ${isInactive ? 'opacity-50' : ''}`}>
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 mt-1.5 shrink-0" />
                                                                        <div className="flex-1 flex justify-between items-start gap-4">
                                                                            <div>
                                                                                <p className={`leading-relaxed ${isInactive ? 'line-through' : ''}`}>{text}</p>
                                                                            </div>
                                                                            <div className="flex gap-2 shrink-0 mt-0.5">
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        if (item?.confirmed || isInactive) return;

                                                                                        let eventData = {};
                                                                                        if (item.calendarEvent) {
                                                                                            eventData = {
                                                                                                ...item.calendarEvent,
                                                                                                detected: true
                                                                                            };
                                                                                        } else {
                                                                                            const now = new Date()
                                                                                            now.setHours(now.getHours() + 1)
                                                                                            eventData = {
                                                                                                title: text,
                                                                                                description: `Action item from session: ${selectedSession.title}`,
                                                                                                dateTime: now.toISOString(),
                                                                                                detected: true
                                                                                            };
                                                                                        }

                                                                                        setEditingEvent({
                                                                                            calendarEvent: eventData,
                                                                                            actionItemIndex: originalIndex
                                                                                        })
                                                                                    }}
                                                                                    disabled={item?.confirmed || isInactive}
                                                                                    title={item?.confirmed ? "Confirmed" : item?.dismissed ? "Rejected" : isPast ? "Past Event" : "Add to Calendar"}
                                                                                    className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all ${item?.confirmed
                                                                                        ? 'bg-amber-500 border-amber-500 text-neutral-950 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                                                                                        : isInactive
                                                                                            ? 'bg-neutral-800/50 border-neutral-800 text-neutral-600 cursor-not-allowed'
                                                                                            : 'bg-transparent border-neutral-600 text-neutral-400 hover:border-amber-500 hover:text-amber-500 hover:bg-amber-500/10'
                                                                                        }`}
                                                                                >
                                                                                    {item?.dismissed ? (
                                                                                        <X className="w-4 h-4" />
                                                                                    ) : (
                                                                                        <Plus className="w-4 h-4" strokeWidth={item?.confirmed ? 3 : 2} />
                                                                                    )}
                                                                                </button>

                                                                                <button
                                                                                    onClick={async (e) => {
                                                                                        e.stopPropagation();
                                                                                        if (item?.confirmed || isInactive) return;
                                                                                        if (window.electron) {
                                                                                            await window.electron.invoke('calendar-dismiss-event', {
                                                                                                fileId: selectedSession.fileId || selectedSession.id,
                                                                                                index: originalIndex
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    disabled={item?.confirmed || isInactive}
                                                                                    title="Reject Suggestion"
                                                                                    className={`w-7 h-7 rounded-md border border-neutral-600 text-neutral-400 flex items-center justify-center transition-all ${isInactive ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-500 hover:text-red-500 hover:bg-red-500/10'}`}
                                                                                >
                                                                                    <X className="w-4 h-4" />
                                                                                </button>

                                                                                {tool && (
                                                                                    <button
                                                                                        onClick={async (e) => {
                                                                                            e.stopPropagation();
                                                                                            if (window.electron) {
                                                                                                try {
                                                                                                    await window.electron.invoke('execute-tool', { tool, params: item.parameters || {} });
                                                                                                } catch (err) {
                                                                                                    console.error("Tool execution failed:", err);
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                        className="h-7 px-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-medium rounded-md transition-colors border border-amber-500/20 flex items-center gap-2"
                                                                                    >
                                                                                        <Zap className="w-3 h-3" />
                                                                                        Execute
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            });
                                                        })()}
                                                        {(!selectedSession.details?.actionItems || selectedSession.details.actionItems.length === 0) && (
                                                            <li className="text-sm text-neutral-500 italic">{t.dashboardPage?.noActionItems || "No action items recorded."}</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {selectedSession.type === 'debug' && (
                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-xs font-mono text-red-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Bug className="w-3 h-3" /> {t.dashboardPage?.reportedBug || "Reported Bug"}
                                                    </h4>
                                                    <p className="text-white font-mono text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                                        {selectedSession.details?.bug}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-mono text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                        <Zap className="w-3 h-3" /> {t.dashboardPage?.solutionApplied || "Solution applied"}
                                                    </h4>
                                                    <p className="text-neutral-300 text-sm leading-relaxed">
                                                        {selectedSession.details?.fix}
                                                    </p>
                                                </div>
                                                {selectedSession.details?.code && (
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
                                <button
                                    onClick={handleRefreshSession}
                                    disabled={isRefreshing || selectedSession.transcriptionStatus === 'processing'}
                                    className="py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 hover:bg-amber-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isRefreshing ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <RefreshCw className="w-4 h-4" />
                                    )}
                                    <span className="text-sm font-medium">{t.sessionsPage?.refresh || "Refresh"}</span>
                                </button>
                                <button className="flex-1 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 hover:text-white text-neutral-300 transition-colors flex items-center justify-center gap-2">
                                    <ExternalLink className="w-4 h-4" /> {t.dashboardPage?.openOverlay || "Open Overlay"}
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

            <EditableEventModal
                isOpen={!!editingEvent}
                onClose={() => setEditingEvent(null)}
                event={editingEvent?.calendarEvent}
                onSave={async (updatedEvent) => {
                    if (window.electron && selectedSession && editingEvent) {
                        try {
                            const result = await window.electron.invoke(
                                'calendar-create-event',
                                {
                                    event: updatedEvent,
                                    fileId: selectedSession.fileId || selectedSession.id,
                                    index: editingEvent.actionItemIndex
                                }
                            );

                            if (result.success) {
                                setEditingEvent(null);
                            } else {
                                console.error("Failed to create event:", result.error);
                                alert("Failed to create event: " + result.error);
                            }
                        } catch (error) {
                            console.error("Error creating event:", error);
                            alert("Error creating event: " + error.message);
                        }
                    }
                }}
            />
        </div>
    )
}
