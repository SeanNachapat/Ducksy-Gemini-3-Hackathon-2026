const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
      send: (channel, data) => {
            const validChannels = [
                  "step-changed",
                  "onboarding-complete",
                  "app-minimize",
                  "app-maximize",
                  "app-close",
                  "request-permissions",
                  "open-system-preferences",
                  "record-audio",
                  "realtime-time-record",
                  "recording-control",  // แก้จาก recording-control-update เป็น recording-control
            ]
            if (validChannels.includes(channel)) {
                  ipcRenderer.send(channel, data)
            }
      },

      receive: (channel, callback) => {
            const validChannels = [
                  "app-ready",
                  "update-available",
                  "language-changed",
                  "permissions-result",
                  "update-record-time",
                  "recording-control-update",
            ]
            if (validChannels.includes(channel)) {
                  ipcRenderer.on(channel, (event, ...args) => callback(...args))
            }
      },

      removeListener: (channel, callback) => {
            ipcRenderer.removeListener(channel, callback)
      },

      // เพิ่ม function นี้
      removeAllListeners: (channel) => {
            ipcRenderer.removeAllListeners(channel)
      },

      invoke: async (channel, data) => {
            const validChannels = [
                  "get-settings",
                  "save-settings",
                  "get-system-info",
                  "check-permissions",
                  "request-microphone",
                  "request-screen",
                  "get-screen-sources",
                  "isInitial",
                  "request-sizeCache",
            ]
            if (validChannels.includes(channel)) {
                  return await ipcRenderer.invoke(channel, data)
            }
            return null
      },

      getMicrophoneDevices: async () => {
            try {
                  await navigator.mediaDevices.getUserMedia({ audio: true })
                  const devices = await navigator.mediaDevices.enumerateDevices()
                  return devices
                        .filter(device => device.kind === "audioinput")
                        .map(device => ({
                              deviceId: device.deviceId,
                              label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
                              kind: device.kind,
                              groupId: device.groupId
                        }))
            } catch (error) {
                  console.error("Failed to get microphone devices:", error)
                  return []
            }
      },
})