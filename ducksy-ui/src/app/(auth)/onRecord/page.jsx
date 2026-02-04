'use client'

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Square, Pause, Play, Mic, Monitor, Camera, Home } from "lucide-react"
import { useRecorder } from "@/hooks/useRecorder"
import { useSettings } from "@/hooks/SettingsContext"
import { useSearchParams } from "next/navigation"

export default function OnRecordPage() {
      const { t } = useSettings()
      const [recordTime, setRecordTime] = useState({ time: 0, formatted: "00:00" })
      const [isPaused, setIsPaused] = useState(false)
      const [isRecording, setIsRecording] = useState(false)
      const [deviceId, setDeviceId] = useState(null)

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

            window.electron.receive('update-record-time', handleTimeUpdate)
            window.electron.receive('recording-paused-state', handlePausedState)
            window.electron.receive('recording-control-update', handleRecordingControl)

            return () => {
                  window.electron.removeAllListeners?.('update-record-time')
                  window.electron.removeAllListeners?.('recording-paused-state')
                  window.electron.removeAllListeners?.('recording-control-update')
            }
      }, [])

      // Sync with useRecorder hook
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
            console.log("Record By : " + deviceId     )
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

      return (
            <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-transparent overflow-hidden">
                  <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative"
                  >
                        {/* Capsule Container */}
                        <div className="relative bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 shadow-2xl shadow-black/50">
                              {/* Glow effect */}
                              <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${isRecording ? 'bg-linear-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 animate-pulse' : 'bg-linear-to-r from-amber-500/10 via-amber-500/10 to-amber-500/10'}`} />

                              <div className="relative flex items-center gap-4">
                                    {isRecording ? (
                                          <>
                                                {/* Recording Indicator */}
                                                <div className="flex items-center gap-2">
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
                                                            className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500'} shadow-lg ${isPaused ? 'shadow-yellow-500/50' : 'shadow-red-500/50'}`}
                                                      />
                                                      <span className={`text-sm font-mono font-bold tracking-wider ${isPaused ? 'text-yellow-400' : 'text-red-400'}`}>
                                                            {isPaused ? t.overlay.paused : t.overlay.rec}
                                                      </span>
                                                </div>

                                                {/* Timer */}
                                                <div className="text-2xl font-mono font-bold text-white tracking-wider min-w-[80px] text-center">
                                                      {formattedDuration || recordTime.formatted}
                                                </div>

                                                {/* Divider */}
                                                <div className="w-px h-8 bg-white/10" />

                                                {/* Control Buttons */}
                                                <div className="flex items-center gap-2">
                                                      {/* Pause/Resume Button */}
                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handlePauseResume}
                                                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all group"
                                                      >
                                                            {isPaused ? (
                                                                  <Play className="w-4 h-4 text-white fill-white" strokeWidth={0} />
                                                            ) : (
                                                                  <Pause className="w-4 h-4 text-white" strokeWidth={2} />
                                                            )}
                                                      </motion.button>

                                                      {/* Stop Button */}
                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleStop}
                                                            className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 hover:border-red-500/50 flex items-center justify-center transition-all group"
                                                      >
                                                            <Square className="w-4 h-4 text-red-400 fill-red-400" strokeWidth={0} />
                                                      </motion.button>
                                                </div>
                                          </>
                                    ) : (
                                          <>
                                                {/* Three Action Buttons */}
                                                <div className="flex items-center gap-3">
                                                      {/* Voice Button */}
                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleVoiceClick}
                                                            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                                                      >
                                                            <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform">
                                                                  <Mic className="w-5 h-5 text-neutral-400 group-hover:text-white" strokeWidth={1.5} />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">{t.voiceRecord}</span>
                                                      </motion.button>

                                                      {/* Screen Share Button */}
                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleScreenClick}
                                                            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                                                      >
                                                            <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform">
                                                                  <Monitor className="w-5 h-5 text-neutral-400 group-hover:text-white" strokeWidth={1.5} />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">{t.overlay.screen}</span>
                                                      </motion.button>

                                                      {/* Camera Button */}
                                                      <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleCameraClick}
                                                            className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all group"
                                                      >
                                                            <div className="p-2 rounded-full bg-neutral-900 group-hover:scale-110 transition-transform">
                                                                  <Camera className="w-5 h-5 text-neutral-400 group-hover:text-white" strokeWidth={1.5} />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-neutral-400 group-hover:text-neutral-200">{t.capture}</span>
                                                      </motion.button>
                                                </div>
                                          </>
                                    )}
                              </div>
                        </div>

                        {/* Drag Handle Indicator */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 p-2 cursor-move" style={{ WebkitAppRegion: 'drag' }}>
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                              <div className="w-1 h-1 rounded-full bg-white/20" />
                        </div>
                  </motion.div>

                  {/* Return to Dashboard Button */}
                  <AnimatePresence>
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
                  </AnimatePresence>
            </div>
      )
}
