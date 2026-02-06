'use client'
import { useEffect, useState } from "react"

const MicDevice = ({
      setMicDevice,
      micDevice
}) => {

      const [deviceList, setDeviceList] = useState([]);
      useEffect(() => {
            if (navigator.mediaDevices) {
                  navigator.mediaDevices.enumerateDevices().then((devices) => {
                        const audioDevices = devices.filter((device) => device.kind === 'audioinput')
                        setDeviceList(audioDevices)
                        if (audioDevices.length > 0) {
                              setMicDevice(audioDevices[0].deviceId);
                              window.electron.send("set-mic-device", audioDevices[0].deviceId)
                        }
                  })
            }
      }, [])

      return <>
            <div className="flex items-center gap-4 text-xs font-medium text-neutral-500 bg-neutral-900/50 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
                  <select value={micDevice || ""} onChange={(e) => { setMicDevice(e.target.value); window.electron.send("set-mic-device", e.target.value) }} className="bg-transparent border-none outline-none">
                        {deviceList.map((device) => (
                              <option key={device.deviceId} value={device.deviceId}>{device.label}</option>
                        ))}
                  </select>
            </div>
      </>
}

export default MicDevice;