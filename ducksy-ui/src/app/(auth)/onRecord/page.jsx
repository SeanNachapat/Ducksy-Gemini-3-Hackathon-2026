'use client'

import { useEffect, useState } from 'react'

function OnRecordPage() {
      const [recordTime, setRecordTime] = useState({ time: 0, formatted: "00:00" })

      useEffect(() => {
            if (!window.electron) return

            window.electron.receive("update-record-time", (data) => {
                  setRecordTime(data)
            })

            return () => {
                  window.electron.removeAllListeners?.("update-record-time")
            }
      }, [])

      const handleStop = () => {
            window.electron.send("recording-control", { action: "stop" })
      }

      const handlePause = () => {
            window.electron.send("recording-control", { action: "pause" })
      }

      return (
            <div className="h-screen bg-neutral-900 rounded-2xl flex items-center justify-between px-6 border border-neutral-800">
                  <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-2xl font-mono text-white tracking-wider">
                              {recordTime.formatted}
                        </span>
                  </div>
                  <div className="flex gap-2">
                        <button
                              onClick={handlePause}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800 hover:bg-neutral-700 transition-colors"
                        >
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                              </svg>
                        </button>
                        <button
                              onClick={handleStop}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                        >
                              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                              </svg>
                        </button>
                  </div>
            </div>
      )
}

export default OnRecordPage