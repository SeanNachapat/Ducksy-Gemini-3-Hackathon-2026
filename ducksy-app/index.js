const { app, BrowserWindow, ipcMain, systemPreferences, desktopCapturer, screen, shell, globalShortcut } = require("electron")
const path = require("path")
const fs = require("fs")
const serve = require("electron-serve")
const db = require("./utils/db")
const { registerIpcHandlers, setMainWindow, setOnRecordingWindow } = require("./ipcHandlers")
require("dotenv").config();

const isProd = process.env.NODE_ENV === "production"

if (isProd) {
      serve({ directory: "out" })
}

let mainWindow
let onRecordingWindow
let selectionWindow
let initalized
let captureWindow
let deviceId

// ─── Recording Window ──────────────────────────────────────────────

async function createOnRecordingWindow() {
      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.show()
            onRecordingWindow.focus()
            return
      }

      const { width } = screen.getPrimaryDisplay().workAreaSize
      const width_f = 450
      const height_f = 250

      onRecordingWindow = new BrowserWindow({
            width: width_f,
            height: height_f,
            minWidth: width_f,
            minHeight: height_f,
            backgroundColor: "#00000000",
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

      setOnRecordingWindow(onRecordingWindow)

      onRecordingWindow.setPosition(width - width_f - 20, 20)
      onRecordingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

      if (isProd) {
            await onRecordingWindow.loadURL("app://./onRecord")
      } else {
            await onRecordingWindow.loadURL("http://localhost:3000/onRecord")
      }

      onRecordingWindow.on("closed", () => {
            onRecordingWindow = null
            setOnRecordingWindow(null)
      })
}

async function createSelectionWindow() {
      if (selectionWindow && !selectionWindow.isDestroyed()) {
            return
      }

      const primaryDisplay = screen.getPrimaryDisplay()
      const { x, y, width, height } = primaryDisplay.bounds

      selectionWindow = new BrowserWindow({
            x,
            y,
            width,
            height,
            backgroundColor: "#00000000",
            frame: false,
            transparent: true,
            alwaysOnTop: true,
            skipTaskbar: true,
            autoHideMenuBar: true,
            hasShadow: false,
            resizable: false,
            movable: false,
            show: false,
            fullscreen: true,
            webPreferences: {
                  preload: path.join(__dirname, "preload.js"),
                  nodeIntegration: false,
                  contextIsolation: true
            }
      })

      selectionWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

      if (isProd) {
            await selectionWindow.loadURL("app://./magic-lens")
      } else {
            await selectionWindow.loadURL("http://localhost:3000/magic-lens")
      }

      selectionWindow.on("closed", () => {
            selectionWindow = null
      })
}


async function createCaptureScreen() {
      if (captureWindow && !captureWindow.isDestroyed()) {
            captureWindow.show()
            captureWindow.focus()
            return
      }

      const { width, height } = screen.getPrimaryDisplay().size;

      captureWindow = new BrowserWindow({
            width,
            height,
            titleBarStyle: "hidden",
            autoHideMenuBar: true,
            alwaysOnTop: true,
            frame: false,
            transparent: true,
            hasShadow: false,
            skipTaskbar: true,
            resizable: false,
            movable: true,
            show: false,
            webPreferences: {
                  preload: path.join(__dirname, "preload.js"),
                  nodeIntegration: false,
                  contextIsolation: true,
                  defaultFontFamily: "monospace"
            },
      })

      captureWindow.loadURL("http://localhost:3000/capture")

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
      createSelectionWindow();

      globalShortcut.register('Alt+S', () => {
            console.log('Alt+S pressed - activating magic lens')
            ipcMain.emit('activate-magic-lens')
      })
})

app.on("window-all-closed", () => {
      globalShortcut.unregisterAll()
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
            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.minimize()
            }
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

      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("recording-control-update", data)
      }

      ipcMain.on("close-overlay", () => {
            closeOnRecordingWindow()
            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.restore()
                  mainWindow.focus()
            }
      })

      if (data.action === "pause" && onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.webContents.send("recording-paused-state", { isPaused: true })
      }

      if (data.action === "resume" && onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.webContents.send("recording-paused-state", { isPaused: false })
      }
})

ipcMain.on("resize-recording-window", (event, { height }) => {
      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            const { width } = onRecordingWindow.getBounds()
            onRecordingWindow.setSize(width, height)
            console.log(`Resized recording window to height: ${height}`)
      }
})

ipcMain.on("set-mic-device", (e, d) => {
      deviceId = d
      console.log("Mic changed to: ", d)
})

ipcMain.handle("set-mic-front", (e, d) => {
      return deviceId;
})

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

ipcMain.handle("delete-db", async () => {
      console.log("Deleting database...")
      try {
            const result = await db.deleteDb();

            if (result.status === "success") {
                  setTimeout(() => {
                        app.exit();
                  }, 500);

                  return { success: true };
            }
            return { success: false, error: result.message };
      } catch (err) {
            console.error("Failed to delete db:", err);
            return { success: false, error: err.message };
      }
});

ipcMain.on("open-system-preferences", (event, type) => {
      openSystemPreferences(type)
})

// ─── IPC: Overlay Window ──────────────────────────────────────

ipcMain.on("activate-magic-lens", async () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.minimize()
      }

      if (!selectionWindow || selectionWindow.isDestroyed()) {
            await createSelectionWindow()
            selectionWindow.show()
            selectionWindow.focus()
      } else {
            selectionWindow.show()
            selectionWindow.focus()
            const primaryDisplay = screen.getPrimaryDisplay()
            const { x, y, width, height } = primaryDisplay.bounds
            selectionWindow.setBounds({ x, y, width, height })
      }
})

ipcMain.on("selection-complete", (event, selection) => {
      console.log("Selection complete:", selection)
      if (selectionWindow && !selectionWindow.isDestroyed()) {
            selectionWindow.hide()
      }

      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("magic-lens-selection", selection)
      }

      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            onRecordingWindow.show()
            onRecordingWindow.focus()
            onRecordingWindow.setAlwaysOnTop(true)
      } else {
            createOnRecordingWindow();
      }
})

ipcMain.on("open-overlay", async () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.minimize()
      }
      if (!onRecordingWindow || onRecordingWindow.isDestroyed()) {
            await createOnRecordingWindow()
      } else {
            onRecordingWindow.show()
            onRecordingWindow.focus()
      }
})

ipcMain.on("close-overlay", () => {
      closeOnRecordingWindow()
      if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.restore()
            mainWindow.focus()
      }
})

ipcMain.on("resize-recording-window", (event, { width, height }) => {
      if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
            const currentBounds = onRecordingWindow.getBounds()
            const newWidth = width || currentBounds.width
            const newHeight = height || currentBounds.height

            onRecordingWindow.setSize(newWidth, newHeight, true)
      }
})

// ─── IPC: Cache ────────────────────────────────────────────────────

ipcMain.handle("request-sizeCache", async (event) => {
      var size = await db.getSizeOfdb()

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