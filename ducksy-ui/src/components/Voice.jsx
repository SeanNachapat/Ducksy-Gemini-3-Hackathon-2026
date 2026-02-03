'use client'

import { useState, useEffect } from "react"
import { Mic, Square, Pause, Play } from "lucide-react"
import { useRecorder } from "@/hooks/useRecorder"
import React from 'react'

const Voice = ({ t, micDevice }) => {
      const {
            isRecording,
            isPaused,
            formattedDuration,
            audioBlob,
            error,
            startRecording,
            pauseRecording,
            resumeRecording,
            stopRecording,
            saveRecording,
            resetRecording,
      } = useRecorder()

      // Auto-save เมื่อ audioBlob พร้อม (หลัง stop)
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

      const handleVoiceRecord = async () => {
            if (!isRecording) {
                  await startRecording(micDevice || null)
            } else {
                  stopRecording()
            }
      }

      const handlePauseResume = (e) => {
            e.stopPropagation()
            if (isPaused) {
                  resumeRecording()
            } else {
                  pauseRecording()
            }
      }

      return (
            <div className="flex flex-col items-center gap-2">
                  {error && (
                        <span className="text-red-400 text-[10px] font-medium px-2 text-center">
                              {error}
                        </span>
                  )}

                  <div className="flex items-center gap-2">
                        {isRecording && (
                              <button
                                    onClick={handlePauseResume}
                                    className="flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300
                                          bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                              >
                                    {isPaused ? (
                                          <Play className="w-4 h-4 text-neutral-300 fill-current" strokeWidth={0} />
                                    ) : (
                                          <Pause className="w-4 h-4 text-neutral-300" strokeWidth={1.5} />
                                    )}
                              </button>
                        )}

                        {/* Main Record/Stop Button */}
                        <button
                              onClick={handleVoiceRecord}
                              className={`flex flex-col items-center justify-center gap-2 h-20 rounded-2xl border transition-all group duration-300
                                    ${isRecording
                                          ? "bg-red-500/10 border-red-500/20 hover:bg-red-500/20 px-6"
                                          : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20 px-8"
                                    }
                              `}
                        >
                              <div className={`p-2 rounded-full transition-transform duration-300 group-hover:scale-110
                                    ${isRecording
                                          ? isPaused
                                                ? "bg-red-500/60 text-white shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                                                : "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse"
                                          : "bg-neutral-900 text-neutral-400 group-hover:text-white"
                                    }
                              `}>
                                    {isRecording ? (
                                          <Square className="w-5 h-5 fill-current" strokeWidth={0} />
                                    ) : (
                                          <Mic className="w-5 h-5" strokeWidth={1.5} />
                                    )}
                              </div>

                              <span className={`text-[10px] font-medium transition-colors font-mono
                                    ${isRecording
                                          ? isPaused
                                                ? "text-red-400/60 font-bold tracking-widest"
                                                : "text-red-400 font-bold tracking-widest"
                                          : "text-neutral-400 group-hover:text-neutral-200"
                                    }
                              `}>
                                    {isRecording
                                          ? isPaused
                                                ? `${formattedDuration} ⏸`
                                                : formattedDuration
                                          : t.voiceRecord
                                    }
                              </span>
                        </button>
                  </div>
            </div>
      )
}

export default Voice;