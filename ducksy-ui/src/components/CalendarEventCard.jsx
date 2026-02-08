import React from 'react'
import { Calendar, ChevronRight, X, Check, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
const CalendarEventCard = ({ event, onReview, onDismiss, t }) => {
    if (!event || !event.detected) return null
    const eventDate = new Date(event.dateTime)
    const timeString = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const isToday = new Date().toDateString() === eventDate.toDateString()
    const dateString = isToday ? (t?.today || "Today") : eventDate.toLocaleDateString()
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 rounded-2xl p-4 border border-white/5 group hover:border-amber-500/30 transition-colors relative overflow-hidden"
        >
            {}
            <div className="absolute top-0 right-0 p-1.5 bg-amber-500/10 rounded-bl-xl border-l border-b border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white mb-1 truncate pr-6">{event.title}</div>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400">
                        <Calendar className="w-3 h-3" />
                        <span>{timeString} • {dateString}</span>
                    </div>
                </div>
            </div>
            {event.confirmed ? (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 w-fit px-3 py-1.5 rounded-lg border border-amber-500/20">
                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    <span>Scheduled</span>
                </div>
            ) : (
                <div className="mt-3 flex gap-2">
                    <button
                        onClick={onReview}
                        className="flex-1 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <Plus className="w-3 h-3" />
                        {t?.session?.add || "Add"}
                    </button>
                    <button
                        onClick={onDismiss}
                        className="px-3 py-1.5 bg-white/5 text-neutral-400 text-xs font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors"
                        title={t?.session?.dismiss || "Dismiss"}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            )}
        </motion.div>
    )
}
export default CalendarEventCard
