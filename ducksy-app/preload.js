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
            ]
            if (validChannels.includes(channel)) {
                  ipcRenderer.on(channel, (event, ...args) => callback(...args))
            }
      },

      removeListener: (channel, callback) => {
            ipcRenderer.removeListener(channel, callback)
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
            ]
            if (validChannels.includes(channel)) {
                  return await ipcRenderer.invoke(channel, data)
            }
            return null
      },
})