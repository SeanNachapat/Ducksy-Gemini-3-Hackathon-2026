'use client'

import { useEffect, useState } from 'react'

function OnRecordPage() {
      const [recordTime, setRecordTime] = useState({ time: 0, formatted: "00:00" })

      useEffect(() => {
            window.electron.receive("update-record-time", (data) => {
                  console.log("Received time:", data)
                  setRecordTime(data)
                  console.log("Record time:", recordTime)
            })

            return () => {
                  window.electron.removeListener("update-record-time")
            }
      }, [])

      const handleStop = () => {
            window.electron.send("recording-control", { action: "stop" })
      }

      const handlePause = () => {
            window.electron.send("recording-control", { action: "pause" })
      }

      return (
            <div className="p-4 bg-gray-900 text-white">
                  <div className="text-3xl font-mono text-center">
                        {recordTime.formatted}
                  </div>
                  <div className="flex gap-2 mt-4 justify-center">
                        <button onClick={handlePause}>Pause</button>
                        <button onClick={handleStop}>Stop</button>
                  </div>
            </div>
      )
}

export default OnRecordPage