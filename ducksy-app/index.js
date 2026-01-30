const { app, BrowserWindow, ipcMain, systemPreferences, desktopCapturer, screen } = require("electron")
const path = require("path")
const serve = require("electron-serve")
const { permission } = require("process")
const db = require("./utils/db")

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
      serve({ directory: "out" })
}

let mainWindow
let onRecordingWindow

async function createOnRecordingWindow() {

      const { width, height } = screen.getPrimaryDisplay().workAreaSize;
      const width_f = 350;
      const height_f = 100;

      onRecordingWindow = new BrowserWindow({
            width: width_f,
            height: height_f,
            minWidth: width_f,
            minHeight: height_f,
            backgroundColor: "#0a0a0a",
            titleBarStyle: "hidden",
            frame: false,
            autoHideMenuBar: true,
            webPreferences: {
                  preload: path.join(__dirname, "preload.js"),
                  nodeIntegration: false,
                  contextIsolation: true,
                  // devTools: false,
                  defaultFontFamily: "monospace"
            },
      })

      onRecordingWindow.setPosition(width - width_f, 20);

      if (isProd) {
            await onRecordingWindow.loadURL("app://./index.html")
      } else {
            await onRecordingWindow.loadURL("http://localhost:3000/onRecord")
            onRecordingWindow.webContents.openDevTools()
      }
}

async function createWindow() {
      mainWindow = new BrowserWindow({
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            backgroundColor: "#0a0a0a",
            titleBarStyle: "hiddenInset",
            trafficLightPosition: { x: 16, y: 16 },
            frame: false,
            autoHideMenuBar: true,
            webPreferences: {
                  preload: path.join(__dirname, "preload.js"),
                  nodeIntegration: false,
                  contextIsolation: true,
                  // devTools: false,
                  defaultFontFamily: "monospace"
            },
      })

      if (isProd) {
            await mainWindow.loadURL("app://./index.html")
      } else {
            await mainWindow.loadURL("http://localhost:3000")
            mainWindow.webContents.openDevTools()
      }

      mainWindow.webContents.on("did-finish-load", () => {
            mainWindow.webContents.send("app-ready")
      })
}

// App lifecycle
app.whenReady().then(createWindow)

app.on("window-all-closed", () => {
      if (process.platform !== "darwin") {
            app.quit()
      }
})

app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
      }
})

async function setUpApplication() {
      // db.exec(`
      //       CREATE TABLE IF NOT EXISTS  (
      //             id INTEGER PRIMARY KEY AUTOINCREMENT,
      //             name TEXT,
      //             email TEXT,
      //             password TEXT
      //       )
      // `)
}

async function getMicrophoneDevices() {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const devices = await navigator.mediaDevices.enumerateDevices()
      console.log("devices", devices)
      return devices.filter(device => device.kind === "audioinput")
}

async function checkPermissions() {
      const permissions = {
            microphone: "unknown",
            screen: "unknown",
      }

      if (process.platform === "darwin") {
            permissions.microphone = systemPreferences.getMediaAccessStatus("microphone")
            permissions.screen = systemPreferences.getMediaAccessStatus("screen")
            console.log("permissions.screen", permissions.screen)
      } else if (process.platform === "win32") {
            permissions.microphone = "granted"
            permissions.screen = "granted"
      } else {
            permissions.microphone = "granted"
            permissions.screen = "granted"
      }

      return permissions
}

async function requestMicrophonePermission() {
      if (process.platform === "darwin") {
            const status = systemPreferences.getMediaAccessStatus("microphone")

            if (status === "not-determined") {
                  const granted = await systemPreferences.askForMediaAccess("microphone")
                  return granted ? "granted" : "denied"
            }

            return status
      }

      return "granted"
}

async function requestScreenPermission() {
      if (process.platform === "darwin") {
            const status = systemPreferences.getMediaAccessStatus("screen")

            if (status === "not-determined" || status === "denied") {
                  try {
                        await desktopCapturer.getSources({ types: ["screen", "window"] })
                  } catch (e) {
                        console.log("Screen permission request triggered")
                  }

                  return systemPreferences.getMediaAccessStatus("screen")
            }

            return status
      }

      return "granted"
}

function openSystemPreferences(type) {
      if (process.platform === "darwin") {
            const { shell } = require("electron")

            if (type === "microphone") {
                  shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
            } else if (type === "screen") {
                  shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
            }
      }
}

ipcMain.on("record-audio", (event, data) => {
      console.log("Record audio:", data)
      createOnRecordingWindow()
})

ipcMain.on("realtime-time-record", (event, data) => {
      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.webContents.send("realtime-time-record", data)
      }
})

ipcMain.on("recording-control-update", (event, data) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("recording-control-update", data)
      }
})

ipcMain.on("step-changed", (event, data) => {
      console.log("Step changed:", data)
})

ipcMain.on("onboarding-complete", (event, data) => {
      console.log("Onboarding complete:", data)
})

ipcMain.on("request-permissions", async (event) => {
      console.log("Requesting permissions...")

      const micStatus = await requestMicrophonePermission()
      const screenStatus = await requestScreenPermission()

      const result = {
            microphone: micStatus,
            screen: screenStatus,
      }

      console.log("Permission results:", result)
      mainWindow.webContents.send("permissions-result", result)
})

ipcMain.handle("check-permissions", async () => {
      return await checkPermissions()
})

ipcMain.handle("request-microphone", async () => {
      return await requestMicrophonePermission()
})

ipcMain.handle("request-screen", async () => {
      return await requestScreenPermission()
})

ipcMain.on("open-system-preferences", (event, type) => {
      openSystemPreferences(type)
})

ipcMain.handle("get-screen-sources", async () => {
      try {
            const sources = await desktopCapturer.getSources({
                  types: ["screen", "window"],
                  thumbnailSize: { width: 150, height: 150 },
            })

            return sources.map(source => ({
                  id: source.id,
                  name: source.name,
                  thumbnail: source.thumbnail.toDataURL(),
            }))
      } catch (e) {
            console.error("Failed to get screen sources:", e)
            return []
      }
})

ipcMain.on("app-minimize", () => {
      mainWindow?.minimize()
})

ipcMain.on("app-maximize", () => {
      if (mainWindow?.isMaximized()) {
            mainWindow.unmaximize()
      } else {
            mainWindow?.maximize()
      }
})

ipcMain.on("app-close", () => {
      mainWindow?.close()
})

ipcMain.handle("get-settings", async () => {
      return {
            language: "en",
            theme: "dark",
      }
})

ipcMain.handle("save-settings", async (event, settings) => {
      console.log("Saving settings:", settings)
      return true
})

ipcMain.handle("get-system-info", async () => {
      return {
            platform: process.platform,
            arch: process.arch,
            version: app.getVersion(),
      }
})