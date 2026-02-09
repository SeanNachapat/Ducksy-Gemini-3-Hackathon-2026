import React, { useState, effective } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, AlignLeft, Check, Loader2 } from 'lucide-react'

const EditableEventModal = ({ isOpen, onClose, event, onConfirm, t }) => {
    const [title, setTitle] = useState(event?.title || '')
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [description, setDescription] = useState(event?.description || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    React.useEffect(() => {
        if (event && isOpen) {
            setTitle(event.title || '')
            setDescription(event.description || '')
            if (event.dateTime) {
                const dt = new Date(event.dateTime)
                // Format for input type="date" (YYYY-MM-DD)
                const yyyy = dt.getFullYear()
                const mm = String(dt.getMonth() + 1).padStart(2, '0')
                const dd = String(dt.getDate()).padStart(2, '0')
                setDate(`${yyyy}-${mm}-${dd}`)

                // Format for input type="time" (HH:MM)
                const hh = String(dt.getHours()).padStart(2, '0')
                const min = String(dt.getMinutes()).padStart(2, '0')
                setTime(`${hh}:${min}`)
            }
        }
    }, [event, isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || !date || !time) return

        setIsSubmitting(true)
        try {
            // Construct ISO string
            const dateTime = new Date(`${date}T${time}`)
            // Create end time (default 1 hour)
            const endTime = new Date(dateTime.getTime() + (event.duration || 60) * 60000)

            await onConfirm({
                title,
                description,
                startTime: dateTime.toISOString(),
                endTime: endTime.toISOString()
            })
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                            <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-amber-500" />
                                {t?.session?.confirmEvent || "Confirm Event"}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-neutral-500 uppercase mb-1.5 ml-1">
                                    {t?.session?.eventTitle || "Event Title"}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all"
                                    placeholder="Enter event title..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-mono text-neutral-500 uppercase mb-1.5 ml-1">
                                        {t?.session?.date || "Date"}
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all appearance-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-mono text-neutral-500 uppercase mb-1.5 ml-1">
                                        {t?.session?.time || "Time"}
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all appearance-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-neutral-500 uppercase mb-1.5 ml-1">
                                    {t?.session?.description || "Description"}
                                </label>
                                <div className="relative">
                                    <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-neutral-500" />
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/5 transition-all min-h-[80px] resize-none"
                                        placeholder="Add description..."
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 hover:text-white text-neutral-400 transition-colors"
                                >
                                    {t?.cancel || "Cancel"}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-2.5 rounded-xl bg-amber-500 text-black text-sm font-bold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                    {t?.session?.addToCalendar || "Add to Calendar"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default EditableEventModal
