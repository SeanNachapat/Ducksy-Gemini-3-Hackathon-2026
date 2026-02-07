'use client'

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Square, Pause, Play, Mic, Monitor, Camera, Home, ChevronDown, ChevronUp, X, Loader2, RefreshCw, CalendarPlus, Check } from "lucide-react"
import { useRecorder } from "@/hooks/useRecorder"
import SessionChat from "@/components/SessionChat"
import MediaPreview from "@/components/MediaPreview"
import { useSettings } from "@/hooks/SettingsContext"
import { useSearchParams } from "next/navigation"

export default function OnRecordPage() {
      const { t } = useSettings()
      const [recordTime, setRecordTime] = useState({ time: 0, formatted: "00:00" })
      const [isPaused, setIsPaused] = useState(false)
      const [isRecording, setIsRecording] = useState(false)
      const [expanded, setExpanded] = useState(false)
      const [transcriptionResult, setTranscriptionResult] = useState(null)
      const [isProcessing, setIsProcessing] = useState(false)
      const [deviceId, setDeviceId] = useState(null)
      const [capturedFile, setCapturedFile] = useState(null)
      const [showCalendarModal, setShowCalendarModal] = useState(false)
      const [calendarLoading, setCalendarLoading] = useState(false)
      const [calendarSuccess, setCalendarSuccess] = useState(false)
      const [eventDate, setEventDate] = useState('')
      const [eventTime, setEventTime] = useState('')

      const {
            isRecording: recorderIsRecording,
            isPaused: recorderIsPaused,
            formattedDuration,
            startRecording,
            pauseRecording,
            resumeRecording,
            stopRecording,
            audioBlob,
            saveRecording,
            resetRecording,
      } = useRecorder()

      useEffect(() => {
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.invoke("set-mic-front").then((d) => {
                        setDeviceId(d)
                        console.log(d)
                  })
            }
      }, [])

      useEffect(() => {
            if (!audioBlob) return

            const save = async () => {
                  const result = await saveRecording()
                  if (result?.success) {
                        console.log("Audio saved:", result.filePath)
                  }
                  resetRecording()
            }

            save()
      }, [audioBlob, saveRecording, resetRecording])

      const handleTranscriptionUpdate = (data) => {
            console.log('Transcription update:', data)

            let parsedData = { ...data }
            if (parsedData.details && typeof parsedData.details === 'string') {
                  try {
                        parsedData.details = JSON.parse(parsedData.details)
                  } catch (e) {
                        console.error('Failed to parse details:', e)
                        parsedData.details = {}
                  }
            }

            if (parsedData.status === 'completed') {
                  setTranscriptionResult(parsedData)
                  setIsProcessing(false)
                  setExpanded(true)
                  if (typeof window !== 'undefined' && window.electron) {
                        window.electron.send('resize-recording-window', { height: 600 })
                  }
            } else if (parsedData.status === 'failed') {
                  setTranscriptionResult(parsedData)
                  setIsProcessing(false)
            } else {
                  setIsProcessing(true)
            }
      }

      useEffect(() => {
            const checkLatestFile = async () => {
                  if (typeof window !== 'undefined' && window.electron) {
                        try {
                              const result = await window.electron.invoke('get-latest-file')
                              if (result && result.success && result.data) {
                                    console.log('Found latest file on mount:', result.data)

                                    if (result.data.filePath && result.data.mimeType) {
                                          setCapturedFile({
                                                filePath: result.data.filePath,
                                                mimeType: result.data.mimeType
                                          })
                                    }

                                    handleTranscriptionUpdate({
                                          fileId: result.data.fileId,
                                          status: result.data.transcriptionStatus,
                                          title: result.data.title,
                                          details: result.data.details,
                                          chatHistory: result.data.chatHistory,
                                          calendarEvent: result.data.calendarEvent
                                    })
                              }
                        } catch (e) {
                              console.error("Failed to check latest file:", e)
                        }
                  }
            }

            checkLatestFile()
      }, [])

      useEffect(() => {
            document.body.style.backgroundColor = 'transparent'
            document.documentElement.style.backgroundColor = 'transparent'

            if (typeof window === 'undefined' || !window.electron) return

            const handleTimeUpdate = (data) => {
                  setRecordTime({
                        time: data.time,
                        formatted: data.formatted
                  })
                  setIsRecording(true)
            }

            const handlePausedState = (data) => {
                  setIsPaused(data.isPaused)
            }

            const handleRecordingControl = (data) => {
                  if (data.action === 'stop') {
                        setIsRecording(false)
                        setRecordTime({ time: 0, formatted: "00:00" })
                  }
            }

            const handleRecordingSaved = async (data) => {
                  console.log('Recording saved:', data)
                  if (data.filePath) {
                        try {
                              const result = await window.electron.invoke('get-latest-file')
                              if (result && result.success && result.data) {
                                    setCapturedFile({
                                          filePath: result.data.filePath,
                                          mimeType: result.data.mimeType
                                    })
                              }
                        } catch (e) {
                              console.error("Failed to get file info:", e)
                        }
                  }
                  setIsProcessing(true)
                  setExpanded(true)
                  window.electron.send('resize-recording-window', { height: 600 })
            }

            window.electron.receive('update-record-time', handleTimeUpdate)
            window.electron.receive('recording-paused-state', handlePausedState)
            window.electron.receive('recording-control-update', handleRecordingControl)
            window.electron.receive('transcription-updated', handleTranscriptionUpdate)
            window.electron.receive('recording-saved', handleRecordingSaved)

            return () => {
                  window.electron.removeAllListeners?.('update-record-time')
                  window.electron.removeAllListeners?.('recording-paused-state')
                  window.electron.removeAllListeners?.('recording-control-update')
                  window.electron.removeAllListeners?.('transcription-updated')
                  window.electron.removeAllListeners?.('recording-saved')
            }
      }, [])

      useEffect(() => {
            setIsRecording(recorderIsRecording)
            setIsPaused(recorderIsPaused)
            if (recorderIsRecording) {
                  setRecordTime({ time: 0, formatted: formattedDuration })
            }
      }, [recorderIsRecording, recorderIsPaused, formattedDuration])

      const handleStop = async () => {
            stopRecording()
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('recording-control', { action: 'stop' })
            }
            setIsProcessing(true)
            setExpanded(true)
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('resize-recording-window', { height: 600 })
            }
      }

      const handlePauseResume = () => {
            if (isPaused) {
                  resumeRecording()
            } else {
                  pauseRecording()
            }
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('recording-control', { action: 'pause' })
            }
      }

      const handleVoiceClick = async () => {
            console.log("Record By : " + deviceId)
            await startRecording(deviceId)
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('record-audio', { action: 'start' })
            }
      }

      const handleScreenClick = () => {
            console.log('Screen share clicked')
      }

      const handleCameraClick = () => {
            console.log('Camera clicked - activating magic lens')
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('activate-magic-lens')
            }
      }

      const handleReturnToDashboard = () => {
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('close-overlay')
            }
      }

      const handleRetry = async () => {
            if (!transcriptionResult?.fileId) return

            setIsProcessing(true)
            if (typeof window !== 'undefined' && window.electron) {
                  try {
                        const result = await window.electron.invoke('retry-transcription', {
                              fileId: transcriptionResult.fileId
                        })
                        if (!result.success) {
                              console.error("Retry failed:", result.error)
                              setIsProcessing(false)
                        }
                  } catch (e) {
                        console.error("Retry error:", e)
                        setIsProcessing(false)
                  }
            }
      }

      const toggleExpand = () => {
            const newExpanded = !expanded
            setExpanded(newExpanded)
            if (typeof window !== 'undefined' && window.electron) {
                  window.electron.send('resize-recording-window', { height: newExpanded ? 600 : 250 })
            }
      }

      return (
            <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-transparent overflow-hidden">
                  <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                  >
                        <div className="relative bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-black/50 draggable">
                              <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${isRecording ? 'bg-linear-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 animate-pulse' : 'bg-linear-to-r from-amber-500/10 via-amber-500/10 to-amber-500/10'}`} />

                              <div className="relative flex items-center gap-2">
                                    {isRecording ? (
                                          <>
                                                <div className="flex items-center gap-2 pl-1 pr-2">
                                                      <motion.div
                                                            animate={{
                                                                  scale: isPaused ? 1 : [1, 1.2, 1],
                                                                  opacity: isPaused ? 0.5 : [1, 0.8, 1]
                                                            }}
                                                            transition={{
                                                                  duration: 1.5,
                                                                  repeat: Infinity,
                                                                  ease: "easeInOut"
                                                            }}
                                                            className={`w-3 h-3 rounded-full ${isPaused ? 'bg-[#eab308]' : 'bg-[#ef4444]'} shadow-lg ${isPaused ? 'shadow-yellow-500/50' : 'shadow-red-500/50'}`}
                                                      />

                                                      <div className="text-lg font-mono font-bold text-white tracking-wider">
                                                            {formattedDuration || recordTime.formatted}
                                                      </div>
                                                </div>

                                                <motion.button
                                                      whileHover={{ scale: 1.05 }}
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={handlePauseResume}
                                                      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group non-draggable"
                                                >
                                                      {isPaused ? (
                                                            <Play className="w-4 h-4 text-white fill-white" strokeWidth={0} />
                                                      ) : (
                                                            <Pause className="w-4 h-4 text-white" strokeWidth={2} />
                                                      )}
                                                </motion.button>

                                                <motion.button
                                                      whileHover={{ scale: 1.05 }}
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={handleStop}
                                                      className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center transition-all group non-draggable"
                                                >
                                                      <Square className="w-4 h-4 text-red-400 fill-red-400" strokeWidth={0} />
                                                </motion.button>
                                          </>
                                    ) : (
                                          <>
                                                <div className="flex items-center gap-2">
                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleVoiceClick}
                                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group non-draggable"
                                                            title={t.voiceRecord}
                                                      >
                                                            <Mic className="w-5 h-5 text-white/70 group-hover:text-white" strokeWidth={1.5} />
                                                      </motion.button>

                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleScreenClick}
                                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group non-draggable"
                                                            title={t.overlay.screen}
                                                      >
                                                            <Monitor className="w-5 h-5 text-white/70 group-hover:text-white" strokeWidth={1.5} />
                                                      </motion.button>

                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleCameraClick}
                                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group non-draggable"
                                                            title={t.capture}
                                                      >
                                                            <Camera className="w-5 h-5 text-white/70 group-hover:text-white" strokeWidth={1.5} />
                                                      </motion.button>
                                                </div>
                                          </>
                                    )}
                              </div>
                        </div>

                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 p-2 cursor-move" style={{ WebkitAppRegion: 'drag' }}>
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                        </div>
                  </motion.div>

                  <AnimatePresence>
                        {expanded && (isProcessing || transcriptionResult) && (
                              <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="w-full max-w-xs mt-4 bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
                              >
                                    {isProcessing ? (
                                          <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center p-6"
                                          >
                                                {capturedFile?.mimeType?.startsWith('image') && (
                                                      <div className="w-full mb-4 rounded-xl overflow-hidden border border-white/10">
                                                            <MediaPreview
                                                                  filePath={capturedFile.filePath}
                                                                  mimeType={capturedFile.mimeType}
                                                                  duration={0}
                                                            />
                                                      </div>
                                                )}

                                                <div className="flex items-center gap-3 py-4">
                                                      <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                                                      <div className="text-left">
                                                            <p className="text-sm font-medium text-white">{t.processing || "Analyzing..."}</p>
                                                            <p className="text-xs text-neutral-500">Using Gemini 2.0 Flash</p>
                                                      </div>
                                                </div>
                                          </motion.div>
                                    ) : transcriptionResult?.status === 'failed' ? (
                                          <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-col items-center justify-center p-8 h-[250px]"
                                          >
                                                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                                      <X className="w-6 h-6 text-red-500" />
                                                </div>
                                                <p className="text-sm font-medium text-white mb-1">{t.error || "Analysis Failed"}</p>
                                                <p className="text-xs text-neutral-500 text-center px-4 mb-6">
                                                      {transcriptionResult.error || "Something went wrong during analysis."}
                                                </p>

                                                <motion.button
                                                      whileHover={{ scale: 1.05 }}
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={handleRetry}
                                                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-neutral-200 transition-colors"
                                                >
                                                      <RefreshCw className="w-4 h-4" />
                                                      Retry Analysis
                                                </motion.button>
                                          </motion.div>
                                    ) : transcriptionResult ? (
                                          <motion.div
                                                initial="hidden"
                                                animate="visible"
                                                variants={{
                                                      hidden: { opacity: 0 },
                                                      visible: {
                                                            opacity: 1,
                                                            transition: {
                                                                  staggerChildren: 0.1
                                                            }
                                                      }
                                                }}
                                                className="flex flex-col h-full"
                                          >
                                                <div className="p-6 border-b border-white/5 flex items-start justify-between bg-neutral-900/30">
                                                      <div>
                                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-white/5 text-neutral-400 border border-white/5">
                                                                        {transcriptionResult.mode || "lens"}
                                                                  </span>
                                                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                                                        {transcriptionResult.type || "summary"}
                                                                  </span>
                                                            </div>
                                                            <h2 className="text-xl font-bold text-white leading-tight">{transcriptionResult.title}</h2>
                                                            <p className="text-xs text-neutral-500 mt-1">{t.session.summary} • Now</p>
                                                      </div>
                                                      <button
                                                            onClick={toggleExpand}
                                                            className="p-2 rounded-full hover:bg-white/10 text-neutral-500 hover:text-white transition-colors"
                                                      >
                                                            <ChevronUp className="w-5 h-5" />
                                                      </button>
                                                </div>

                                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar max-h-[400px]">
                                                      {transcriptionResult.details?.topic && (
                                                            <motion.div
                                                                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                                                  className="space-y-2"
                                                            >
                                                                  <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{t.session.topic}</h3>
                                                                  <p className="text-sm text-neutral-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                                                        {transcriptionResult.details.topic}
                                                                  </p>
                                                            </motion.div>
                                                      )}

                                                      {transcriptionResult.details?.summary && (
                                                            <motion.div
                                                                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                                                  className="space-y-2"
                                                            >
                                                                  <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{t.session.summary}</h3>
                                                                  <p className="text-sm text-neutral-300 leading-relaxed">
                                                                        {transcriptionResult.details.summary}
                                                                  </p>
                                                            </motion.div>
                                                      )}

                                                      {transcriptionResult.details?.actionItems && transcriptionResult.details.actionItems.length > 0 && (
                                                            <motion.div
                                                                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                                                  className="space-y-2"
                                                            >
                                                                  <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{t.session.actionItems}</h3>
                                                                  <ul className="space-y-2">
                                                                        {transcriptionResult.details.actionItems.map((item, i) => (
                                                                              <motion.li
                                                                                    key={i}
                                                                                    variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}
                                                                                    className="flex items-start gap-3 text-sm text-neutral-300 bg-white/[0.02] p-3 rounded-xl border border-white/5 hover:bg-white/[0.05] transition-colors"
                                                                              >
                                                                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                                                                    <span>{item}</span>
                                                                              </motion.li>
                                                                        ))}
                                                                  </ul>
                                                            </motion.div>
                                                      )}
                                                      {transcriptionResult.details?.code && (
                                                            <motion.div
                                                                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                                                  className="space-y-2"
                                                            >
                                                                  <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest">{t.session.code}</h3>
                                                                  <div className="p-3 bg-black/30 rounded-xl border border-white/5 font-mono text-xs text-neutral-300 overflow-x-auto">
                                                                        <pre>{transcriptionResult.details.code}</pre>
                                                                  </div>
                                                            </motion.div>
                                                      )}


                                                      <div className="pt-4 border-t border-white/5">
                                                            <SessionChat
                                                                  fileId={transcriptionResult.fileId || transcriptionResult.id}
                                                                  initialHistory={transcriptionResult.chatHistory || []}
                                                            />
                                                      </div>
                                                </div>
                                                <div className="p-4 border-t border-white/5 bg-neutral-900/50 flex justify-between items-center gap-2">
                                                      <button
                                                            onClick={async () => {
                                                                  if (typeof window !== 'undefined' && window.electron) {
                                                                        try {
                                                                              const result = await window.electron.invoke('get-latest-file')
                                                                              if (result && result.success && result.data) {
                                                                                    if (result.data.filePath && result.data.mimeType) {
                                                                                          setCapturedFile({
                                                                                                filePath: result.data.filePath,
                                                                                                mimeType: result.data.mimeType
                                                                                          })
                                                                                    }
                                                                                    handleTranscriptionUpdate({
                                                                                          fileId: result.data.fileId,
                                                                                          status: result.data.transcriptionStatus,
                                                                                          title: result.data.title,
                                                                                          details: result.data.details,
                                                                                          chatHistory: result.data.chatHistory,
                                                                                          calendarEvent: result.data.calendarEvent
                                                                                    })
                                                                              }
                                                                        } catch (e) {
                                                                              console.error("Refresh failed:", e)
                                                                        }
                                                                  }
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-2 bg-white/5 text-neutral-400 text-xs font-medium rounded-lg hover:bg-white/10 hover:text-white transition-colors border border-white/10"
                                                            title={t.sessionsPage?.refresh || "Refresh"}
                                                      >
                                                            <RefreshCw className="w-4 h-4" />
                                                            {t.sessionsPage?.refresh || "Refresh"}
                                                      </button>

                                                      <button
                                                            onClick={() => {
                                                                  // If AI detected calendar event, use that date/time
                                                                  if (transcriptionResult?.calendarEvent?.detected && transcriptionResult?.calendarEvent?.dateTime) {
                                                                        const dt = new Date(transcriptionResult.calendarEvent.dateTime)
                                                                        setEventDate(dt.toISOString().split('T')[0])
                                                                        setEventTime(dt.toTimeString().slice(0, 5))
                                                                  } else {
                                                                        // Fallback to now + 1 hour
                                                                        const now = new Date()
                                                                        now.setHours(now.getHours() + 1)
                                                                        setEventDate(now.toISOString().split('T')[0])
                                                                        setEventTime(now.toTimeString().slice(0, 5))
                                                                  }
                                                                  setCalendarSuccess(false)
                                                                  setShowCalendarModal(true)
                                                            }}
                                                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${transcriptionResult?.calendarEvent?.detected
                                                                  ? 'bg-amber-500/20 text-amber-400 border-2 border-amber-500/50 hover:bg-amber-500/30'
                                                                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'}`}
                                                            title={transcriptionResult?.calendarEvent?.detected
                                                                  ? `Add: ${transcriptionResult.calendarEvent.title} @ ${new Date(transcriptionResult.calendarEvent.dateTime).toLocaleString()}`
                                                                  : "Add to Calendar"}
                                                      >
                                                            <CalendarPlus className="w-4 h-4" />
                                                            Calendar
                                                      </button>

                                                      <button
                                                            onClick={() => window.electron.send('close-overlay')}
                                                            className="px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                                                      >
                                                            Done
                                                      </button>
                                                </div>

                                                {/* Calendar Modal */}
                                                <AnimatePresence>
                                                      {showCalendarModal && (
                                                            <motion.div
                                                                  initial={{ opacity: 0 }}
                                                                  animate={{ opacity: 1 }}
                                                                  exit={{ opacity: 0 }}
                                                                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                                                            >
                                                                  <motion.div
                                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                                        className="bg-neutral-900 border border-white/10 rounded-2xl p-5 w-full max-w-xs"
                                                                  >
                                                                        {calendarSuccess ? (
                                                                              <div className="text-center py-4">
                                                                                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                                                                          <Check className="w-6 h-6 text-emerald-500" />
                                                                                    </div>
                                                                                    <p className="text-sm font-medium text-white mb-1">Event Added!</p>
                                                                                    <p className="text-xs text-neutral-500">Check your Google Calendar</p>
                                                                                    <button
                                                                                          onClick={() => {
                                                                                                setShowCalendarModal(false)
                                                                                                setCalendarSuccess(false)
                                                                                          }}
                                                                                          className="mt-4 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg"
                                                                                    >
                                                                                          Close
                                                                                    </button>
                                                                              </div>
                                                                        ) : (
                                                                              <>
                                                                                    <h3 className="text-sm font-bold text-white mb-4">Add to Calendar</h3>

                                                                                    <div className="space-y-3">
                                                                                          <div>
                                                                                                <label className="block text-xs text-neutral-500 mb-1">Date</label>
                                                                                                <input
                                                                                                      type="date"
                                                                                                      value={eventDate}
                                                                                                      onChange={(e) => setEventDate(e.target.value)}
                                                                                                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                                                                                />
                                                                                          </div>
                                                                                          <div>
                                                                                                <label className="block text-xs text-neutral-500 mb-1">Time</label>
                                                                                                <input
                                                                                                      type="time"
                                                                                                      value={eventTime}
                                                                                                      onChange={(e) => setEventTime(e.target.value)}
                                                                                                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                                                                                                />
                                                                                          </div>
                                                                                    </div>

                                                                                    <div className="flex gap-2 mt-4">
                                                                                          <button
                                                                                                onClick={() => setShowCalendarModal(false)}
                                                                                                className="flex-1 px-3 py-2 bg-white/5 text-neutral-400 text-xs font-medium rounded-lg hover:bg-white/10"
                                                                                          >
                                                                                                Cancel
                                                                                          </button>
                                                                                          <button
                                                                                                onClick={async () => {
                                                                                                      if (!eventDate || !eventTime) return
                                                                                                      setCalendarLoading(true)
                                                                                                      try {
                                                                                                            const startTime = new Date(`${eventDate}T${eventTime}`).toISOString()
                                                                                                            const endTime = new Date(new Date(`${eventDate}T${eventTime}`).getTime() + 60 * 60 * 1000).toISOString()

                                                                                                            const result = await window.electron.invoke('calendar-create-event', {
                                                                                                                  title: transcriptionResult?.title || 'New Event',
                                                                                                                  description: transcriptionResult?.details?.summary || '',
                                                                                                                  startTime,
                                                                                                                  endTime
                                                                                                            })

                                                                                                            if (result.success) {
                                                                                                                  setCalendarSuccess(true)
                                                                                                            } else {
                                                                                                                  alert(result.error || 'Failed to create event')
                                                                                                            }
                                                                                                      } catch (e) {
                                                                                                            console.error('Calendar error:', e)
                                                                                                            alert('Failed to create event')
                                                                                                      } finally {
                                                                                                            setCalendarLoading(false)
                                                                                                      }
                                                                                                }}
                                                                                                disabled={calendarLoading}
                                                                                                className="flex-1 px-3 py-2 bg-amber-500 text-black text-xs font-bold rounded-lg hover:bg-amber-400 disabled:opacity-50"
                                                                                          >
                                                                                                {calendarLoading ? 'Adding...' : 'Add Event'}
                                                                                          </button>
                                                                                    </div>
                                                                              </>
                                                                        )}
                                                                  </motion.div>
                                                            </motion.div>
                                                      )}
                                                </AnimatePresence>
                                          </motion.div>
                                    ) : null}
                              </motion.div>
                        )}
                  </AnimatePresence >

                  < AnimatePresence >
                        {!isRecording && (
                              <motion.button
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleReturnToDashboard}
                                    className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/80 backdrop-blur-md border border-white/10 hover:border-amber-500/30 hover:bg-neutral-800/80 transition-all group"
                              >
                                    <Home className="w-4 h-4 text-neutral-400 group-hover:text-amber-400" strokeWidth={1.5} />
                                    <span className="text-xs font-medium text-neutral-400 group-hover:text-amber-400">{t.overlay.returnDashboard}</span>
                              </motion.button>
                        )}
                  </AnimatePresence >
            </div >
      )
}
