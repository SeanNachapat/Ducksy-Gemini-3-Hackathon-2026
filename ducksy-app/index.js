const { app, BrowserWindow, ipcMain, systemPreferences, desktopCapturer, screen, shell } = require("electron")
const path = require("path")
const fs = require("fs")
const serve = require("electron-serve")
const db = require("./utils/db")
const { registerIpcHandlers, setMainWindow } = require("./ipcHandlers")

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
      serve({ directory: "out" })
}

let mainWindow
let onRecordingWindow
let initalized

// ─── Recording Window ──────────────────────────────────────────────

async function createOnRecordingWindow() {
      const { width } = screen.getPrimaryDisplay().workAreaSize
      const width_f = 350
      const height_f = 100

      onRecordingWindow = new BrowserWindow({
            width: width_f,
            height: height_f,
            minWidth: width_f,
            minHeight: height_f,
            backgroundColor: "#0a0a0a",
            titleBarStyle: "hidden",
            autoHideMenuBar: true,
            alwaysOnTop: true,
            frame: false,
            transparent: true,
            hasShadow: false,
            skipTaskbar: true,
            resizable: false,
            movable: true,
            webPreferences: {
                  preload: path.join(__dirname, "preload.js"),
                  nodeIntegration: false,
                  contextIsolation: true,
                  defaultFontFamily: "monospace"
            },
      })

      onRecordingWindow.setPosition(width - width_f - 20, 20)
      onRecordingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

      if (isProd) {
            await onRecordingWindow.loadURL("app://./onRecord")
      } else {
            await onRecordingWindow.loadURL("http://localhost:3000/onRecord")
      }

      onRecordingWindow.on("closed", () => {
            onRecordingWindow = null
      })
}

function closeOnRecordingWindow() {
      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.close()
            onRecordingWindow = null
      }
}

// ─── Main Window ───────────────────────────────────────────────────

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
                  defaultFontFamily: "monospace"
            },
      })

      setMainWindow(mainWindow);
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

// ─── App Lifecycle ─────────────────────────────────────────────────

app.whenReady().then(async () => {
      createWindow()
      registerIpcHandlers();
})

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

// ─── Permissions ───────────────────────────────────────────────────

async function checkPermissions() {
      const permissions = {
            microphone: "unknown",
            screen: "unknown",
      }

      if (process.platform === "darwin") {
            permissions.microphone = systemPreferences.getMediaAccessStatus("microphone")
            permissions.screen = systemPreferences.getMediaAccessStatus("screen")
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
            if (type === "microphone") {
                  shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone")
            } else if (type === "screen") {
                  shell.openExternal("x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture")
            }
      }
}

// ─── IPC: Recording ────────────────────────────────────────────────

ipcMain.on("record-audio", async (event, data) => {
      console.log("Record audio:", data.action)

      const { action } = data

      if (action === "start") {
            await createOnRecordingWindow()
      }
})

ipcMain.on("realtime-time-record", (event, data) => {
      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.webContents.send("update-record-time", data)
      }
})

ipcMain.on("recording-control", (event, data) => {
      console.log("Recording control:", data.action)

      // Forward control action to the main window (renderer)
      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("recording-control-update", data)
      }

      // Update the recording overlay window based on action
      if (data.action === "stop") {
            closeOnRecordingWindow()
      }

      // For pause/resume, forward the state to the overlay window
      if (data.action === "pause" && onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.webContents.send("recording-paused-state", { isPaused: true })
      }

      if (data.action === "resume" && onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.webContents.send("recording-paused-state", { isPaused: false })
      }
})

// ─── IPC: Onboarding / Steps ──────────────────────────────────────

ipcMain.handle("isInitial", async (event, data) => {
      const status = await db.isAlreadyFile()
      await db.initializeDatabase()
      return status
})

ipcMain.on("step-changed", (event, data) => {
      console.log("Step changed:", data)
})

ipcMain.on("onboarding-complete", (event, data) => {
      console.log("Onboarding complete:", data)
})

// ─── IPC: Permissions ──────────────────────────────────────────────

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

// ─── IPC: Cache ────────────────────────────────────────────────────

ipcMain.handle("request-sizeCache", async (event) => {
      var size = await db.getSizeOfdb()

      // Maximum 2 GB to Percent
      var maxCacheSize = 2 * 1024 * 1024 * 1024
      var percent = (size / maxCacheSize) * 100

      percent = percent.toFixed(2)
      size = size.toFixed(2)

      var status = {
            status: "",
            percent,
            size,
      }

      if (percent > 100) {
            status.status = "danger"
      } else if (percent >= 50 && percent <= 70) {
            status.status = "warning"
      } else {
            status.status = "emerald"
      }

      console.log(status)
      return status
})

// ─── IPC: Screen Sources ──────────────────────────────────────────

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

// ─── IPC: Window Controls ─────────────────────────────────────────

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

// ─── IPC: Settings ────────────────────────────────────────────────

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