const { ipcMain, app, shell } = require("electron");
const path = require("path");
const fs = require("fs");
const db = require("./utils/db");
const { getSessionData } = require("./utils/sessionHelper");
const { transcribeAudio, analyzeImage, chatWithSession } = require("./utils/gemini");
const googleCalendar = require("./utils/mcp/googleCalendar");
const notion = require("./utils/mcp/notion");
require("dotenv").config();

let mainWindow = null;
let onRecordingWindow = null;
let geminiApiKey = process.env.GEMINI_API_KEY;
let latestFileId = null;

const setMainWindow = (window) => {
      mainWindow = window;
};

const setOnRecordingWindow = (window) => {
      onRecordingWindow = window;
};

const setGeminiApiKey = (apiKey) => {
      geminiApiKey = apiKey;
};

const processTranscription = async (fileId, filePath, mimeType, userLanguage = 'en', settings = {}) => {
      if (!geminiApiKey) {
            console.error("Gemini API key not set");
            const transcription = await db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  await db.updateTranscription({
                        id: transcription.id,
                        status: "failed"
                  });
            }
            return;
      }

      try {
            const transcription = await db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  await db.updateTranscription({
                        id: transcription.id,
                        status: "processing"
                  });
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "processing"
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "processing"
                  });
            }

            const audioBuffer = fs.readFileSync(filePath);
            const base64Audio = audioBuffer.toString("base64");

            const result = await transcribeAudio(base64Audio, mimeType, geminiApiKey, userLanguage, settings);

            const updatedTranscription = await db.getTranscriptionByFileId(fileId);
            if (updatedTranscription) {
                  await db.updateTranscription({
                        id: updatedTranscription.id,
                        type: result.type,
                        title: result.title,
                        summary: result.summary,
                        content: result.content,
                        language: result.language,
                        status: "completed",
                        details: result.details
                  });

                  await db.updateFile({
                        id: fileId,
                        title: result.title
                  });
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "completed",
                        title: result.title,
                        details: result.details
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "completed",
                        title: result.title,
                        details: result.details
                  });
            }

            console.log(`Transcription completed for file ${fileId}`);
      } catch (error) {
            console.error(`Transcription failed for file ${fileId}:`, error);

            const transcription = await db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  await db.updateTranscription({
                        id: transcription.id,
                        status: "failed"
                  });
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "failed",
                        error: error.message
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "failed",
                        error: error.message
                  });
            }
      }
};

const processImageAnalysis = async (fileId, filePath, mimeType, userLanguage = 'en', settings = {}) => {
      if (!geminiApiKey) {
            console.error("Gemini API key not set");
            const transcription = await db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  await db.updateTranscription({
                        id: transcription.id,
                        status: "failed"
                  });
            }
            return;
      }

      try {
            const transcription = await db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  await db.updateTranscription({
                        id: transcription.id,
                        status: "processing"
                  });
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "processing"
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "processing"
                  });
            }

            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString("base64");

            const fileRec = await db.getFileById(fileId);
            const metadata = fileRec && fileRec.metadata ? JSON.parse(fileRec.metadata) : null;

            const result = await analyzeImage(base64Image, mimeType, geminiApiKey, null, metadata, userLanguage, settings);

            const updatedTranscription = await db.getTranscriptionByFileId(fileId);
            if (updatedTranscription) {
                  await db.updateTranscription({
                        id: updatedTranscription.id,
                        type: result.type,
                        title: result.title,
                        summary: result.summary,
                        content: result.content,
                        language: result.language,
                        status: "completed",
                        details: result.details
                  });

                  await db.updateFile({
                        id: fileId,
                        title: result.title
                  });
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "completed",
                        title: result.title,
                        details: result.details
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "completed",
                        title: result.title,
                        details: result.details
                  });
            }

            console.log(`Image analysis completed for file ${fileId}`);
      } catch (error) {
            console.error(`Image analysis failed for file ${fileId}:`, error);

            const transcription = await db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  await db.updateTranscription({
                        id: transcription.id,
                        status: "failed"
                  });
            }

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "failed",
                        error: error.message
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "failed",
                        error: error.message
                  });
            }
      }
};

const registerIpcHandlers = () => {
      ipcMain.handle("get-session-logs", async () => {
            try {
                  const sessionLogs = await db.getSessionLogs();
                  return { success: true, data: sessionLogs };
            } catch (err) {
                  console.error("Failed to get session logs:", err);
                  return { success: false, error: err.message, data: [] };
            }
      });

      ipcMain.handle("get-session", async (event, { fileId }) => {
            try {
                  const file = await db.getFileById(fileId);
                  if (!file) {
                        return { success: false, error: "Session not found" };
                  }

                  let details = {};
                  try {
                        details = file.transcriptionDetails ? JSON.parse(file.transcriptionDetails) : {};
                  } catch (e) {
                        details = {};
                  }

                  const session = {
                        id: file.id,
                        fileId: file.id,
                        transcriptionId: file.transcriptionId,
                        type: file.transcriptionType || details.type || "summary",
                        title: file.transcriptionTitle || file.title,
                        mode: file.mode === "ghost" ? "Ghost Mode 👻" : "Lens Mode 🕶️",
                        details: {
                              topic: details.topic || file.title,
                              summary: file.transcriptionSummary || "",
                              actionItems: details.actionItems || [],
                              question: details.question || "",
                              answer: details.answer || "",
                              bug: details.bug || "",
                              fix: details.fix || "",
                              code: details.code || ""
                        },
                        transcriptionStatus: file.transcriptionStatus,
                        duration: file.duration,
                        filePath: file.path,
                        createdAt: file.createdAt
                  };

                  return { success: true, data: session };
            } catch (err) {
                  console.error("Failed to get session:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("delete-session", async (event, { fileId }) => {
            try {
                  const file = await db.getFileById(fileId);

                  if (file) {
                        if (file.path && fs.existsSync(file.path)) {
                              fs.unlinkSync(file.path);
                              console.log(`Deleted audio file: ${file.path}`);
                        }
                        await db.deleteFile(fileId);
                        console.log(`Deleted session: ${fileId}`);
                  }

                  return { success: true };
            } catch (err) {
                  console.error("Failed to delete session:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("save-audio-file", async (event, data) => {
            const { buffer, mimeType, duration, mode = "lens", title = "", userLanguage = "en", settings = {} } = data;

            try {
                  const ext = mimeType.includes("mp4")
                        ? "m4a"
                        : mimeType.includes("ogg")
                              ? "ogg"
                              : "webm";

                  const timestamp = Date.now();
                  const fileName = `recording_${timestamp}.${ext}`;
                  const fileNameWithoutExt = `recording_${timestamp}`;

                  const savePath = path.join(app.getPath("userData"), "recordings");

                  if (!fs.existsSync(savePath)) {
                        fs.mkdirSync(savePath, { recursive: true });
                  }

                  const filePath = path.join(savePath, fileName);
                  const audioBuffer = Buffer.from(buffer, "base64");
                  fs.writeFileSync(filePath, audioBuffer);

                  console.log(`Audio saved: ${filePath} (${duration}s)`);

                  if (duration < 5) {
                        try {
                              fs.unlinkSync(filePath);
                        } catch (e) {
                              console.error("Failed to delete short recording:", e);
                        }
                        return {
                              success: false,
                              error: "Recording too short (min 5s)",
                              isShort: true
                        };
                  }

                  const fileResult = await db.createFile({
                        title: title || `Recording ${new Date().toLocaleString()}`,
                        mode: mode,
                        description: "",
                        name: fileNameWithoutExt,
                        path: filePath,
                        size: audioBuffer.length,
                        type: mimeType,
                        isAnalyzed: 0,
                        duration: duration
                  });

                  const fileId = fileResult.lastID;
                  latestFileId = fileId;

                  await db.createTranscription({
                        fileId: fileId,
                        type: "summary",
                        title: title || `Recording ${new Date().toLocaleString()}`,
                        summary: "",
                        content: "",
                        language: userLanguage,
                        status: "pending",
                        details: {},
                        calendarEventId: null,
                        notionPageId: null
                  });

                  if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send("recording-saved", {
                              fileId: fileId,
                              filePath: filePath,
                              fileName: fileName
                        });
                  }

                  if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                        onRecordingWindow.webContents.send("recording-saved", {
                              fileId: fileId,
                              filePath: filePath,
                              fileName: fileName
                        });
                  }

                  processTranscription(fileId, filePath, mimeType, userLanguage, settings);

                  return {
                        success: true,
                        fileId: fileId,
                        filePath: filePath,
                        fileName: fileName,
                        duration: duration,
                        size: audioBuffer.length
                  };
            } catch (err) {
                  console.error("Failed to save audio file:", err);
                  return {
                        success: false,
                        error: err.message
                  };
            }
      });

      ipcMain.handle("save-image-file", async (event, data) => {
            const { buffer, mimeType, width, height, title, mode = "lens", selection, userLanguage = "en", settings = {} } = data;

            try {
                  const timestamp = Date.now();
                  const fileName = `capture_${timestamp}.png`;
                  const fileNameWithoutExt = `capture_${timestamp}`;

                  const savePath = path.join(app.getPath("userData"), "captures");

                  if (!fs.existsSync(savePath)) {
                        fs.mkdirSync(savePath, { recursive: true });
                  }

                  const filePath = path.join(savePath, fileName);

                  let base64Data = buffer;
                  if (typeof buffer === 'string' && buffer.startsWith('data:')) {
                        base64Data = buffer.replace(/^data:image\/\w+;base64,/, "");
                  }

                  const imageBuffer = Buffer.from(base64Data, "base64");
                  fs.writeFileSync(filePath, imageBuffer);

                  const fileResult = await db.createFile({
                        title: title || `Capture ${new Date(timestamp).toLocaleString()}`,
                        mode: mode,
                        description: "",
                        name: fileNameWithoutExt,
                        path: filePath,
                        size: imageBuffer.length,
                        type: mimeType || "image/png",
                        isAnalyzed: 0,
                        duration: 0,
                        metadata: selection || {}
                  });

                  const fileId = fileResult.lastID;
                  latestFileId = fileId;

                  await db.createTranscription({
                        fileId: fileId,
                        status: "pending",
                        type: "summary",
                        title: title || `Capture ${new Date(timestamp).toLocaleString()}`,
                        summary: "",
                        content: "",
                        language: "en",
                        details: {},
                        calendarEventId: null,
                        notionPageId: null
                  });

                  const notificationData = {
                        fileId: fileId,
                        filePath: filePath,
                        fileName: fileName
                  };

                  if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send("recording-saved", notificationData);
                  }

                  if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                        onRecordingWindow.webContents.send("recording-saved", notificationData);
                  }

                  processImageAnalysis(fileId, filePath, mimeType || "image/png", userLanguage, settings);

                  return {
                        success: true,
                        fileId: fileId,
                        filePath: filePath
                  };
            } catch (err) {
                  console.error("Failed to save image file:", err);
                  return { success: false, error: err.message };
            }
      });
      ipcMain.handle("update-transcription", async (event, data) => {
            const { fileId, type, title, summary, content, language, status, details } = data;

            try {
                  const transcription = await db.getTranscriptionByFileId(fileId);

                  if (!transcription) {
                        return { success: false, error: "Transcription not found" };
                  }

                  await db.updateTranscription({
                        id: transcription.id,
                        type: type,
                        title: title,
                        summary: summary,
                        content: content,
                        language: language,
                        status: status,
                        details: details
                  });

                  if (title) {
                        await db.updateFile({
                              id: fileId,
                              title: title
                        });
                  }

                  if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send("transcription-updated", {
                              fileId: fileId,
                              status: status,
                              title: title,
                              details: details
                        });
                  }

                  return { success: true };
            } catch (err) {
                  console.error("Failed to update transcription:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("get-all-files", async () => {
            try {
                  const files = await db.getAllFiles();
                  return { success: true, data: files };
            } catch (err) {
                  console.error("Failed to get files:", err);
                  return { success: false, error: err.message, data: [] };
            }
      });

      ipcMain.handle("get-db-size", async () => {
            try {
                  const size = await db.getSizeOfdb();
                  return { success: true, size: size };
            } catch (err) {
                  console.error("Failed to get db size:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("set-gemini-api-key", async (event, { apiKey }) => {
            try {
                  geminiApiKey = apiKey;
                  return { success: true };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("retry-transcription", async (event, { fileId, userLanguage = "en", settings = {} }) => {
            try {
                  const file = await db.getFileById(fileId);
                  if (!file) {
                        return { success: false, error: "File not found" };
                  }

                  if (file.type.startsWith("image/")) {
                        processImageAnalysis(fileId, file.path, file.type, userLanguage, settings);
                  } else {
                        processTranscription(fileId, file.path, file.type, userLanguage, settings);
                  }

                  return { success: true };
            } catch (err) {
                  console.error("Failed to retry transcription:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("chat-session", async (event, { fileId, message, settings = {} }) => {
            if (!geminiApiKey) {
                  return { success: false, error: "API Key not set" };
            }

            try {
                  const file = await db.getFileById(fileId);
                  if (!file) {
                        return { success: false, error: "Session not found" };
                  }

                  let chatHistory = [];
                  const transcription = await db.getTranscriptionByFileId(fileId);

                  if (transcription && transcription.chatHistory && transcription.chatHistory !== '[]') {
                        try {
                              chatHistory = JSON.parse(transcription.chatHistory);
                        } catch (e) {
                              chatHistory = [];
                        }
                  }

                  let details = {};
                  try {
                        details = transcription.details ? JSON.parse(transcription.details) : {};
                  } catch (e) { }

                  const context = {
                        title: transcription.title,
                        summary: transcription.summary,
                        content: transcription.content,
                        details: details
                  };

                  const responseText = await chatWithSession(context, chatHistory, message, geminiApiKey, settings);

                  const newHistory = [
                        ...chatHistory,
                        { role: 'user', content: message, timestamp: Date.now() },
                        { role: 'model', content: responseText, timestamp: Date.now() }
                  ];

                  await db.updateTranscription({
                        id: transcription.id,
                        chatHistory: newHistory
                  });

                  return { success: true, response: responseText, history: newHistory };

            } catch (err) {
                  console.error("Chat session error:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("get-latest-file", async () => {
            if (!latestFileId) {
                  return { success: false, error: "No active file" };
            }
            return await getSessionData(latestFileId);
      });

      ipcMain.handle("read-file-as-base64", async (event, { filePath, mimeType }) => {
            try {
                  if (!filePath || !fs.existsSync(filePath)) {
                        return { success: false, error: "File not found" };
                  }

                  const buffer = fs.readFileSync(filePath);
                  const base64 = buffer.toString("base64");
                  const dataUrl = `data:${mimeType || 'application/octet-stream'};base64,${base64}`;

                  return { success: true, dataUrl };
            } catch (err) {
                  console.error("Failed to read file as base64:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.on("open-external", (event, url) => {
            if (url && typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://"))) {
                  shell.openExternal(url);
            }
      });

      ipcMain.handle("mcp-get-status", async () => {
            try {
                  const googleConnected = await googleCalendar.isConnected();
                  const notionConnected = await notion.isConnected();
                  const notionDatabases = notionConnected ? await notion.getDatabases().catch(() => []) : [];
                  const selectedDb = notionConnected ? await notion.getSelectedDatabase() : null;

                  return {
                        success: true,
                        google_calendar: { connected: googleConnected },
                        notion: { connected: notionConnected, databases: notionDatabases, selectedDatabase: selectedDb }
                  };
            } catch (err) {
                  console.error("MCP status error:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-google-get-auth-url", async (event, { clientId, clientSecret }) => {
            try {
                  const url = await googleCalendar.getAuthUrl(clientId, clientSecret);
                  return { success: true, url };
            } catch (err) {
                  console.error("Google auth URL error:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-google-exchange-code", async (event, { code }) => {
            try {
                  await googleCalendar.exchangeCodeForTokens(code);
                  return { success: true };
            } catch (err) {
                  console.error("Google token exchange error:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-google-disconnect", async () => {
            try {
                  await googleCalendar.disconnect();
                  return { success: true };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-notion-connect", async (event, { accessToken, workspaceInfo }) => {
            try {
                  await notion.saveAccessToken(accessToken, workspaceInfo);
                  return { success: true };
            } catch (err) {
                  console.error("Notion connect error:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-notion-disconnect", async () => {
            try {
                  await notion.disconnect();
                  return { success: true };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-notion-set-database", async (event, { databaseId }) => {
            try {
                  await notion.setSelectedDatabase(databaseId);
                  return { success: true };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-sync-session", async (event, { fileId, providers }) => {
            try {
                  const sessionResult = await getSessionData(fileId);
                  if (!sessionResult.success) {
                        return { success: false, error: "Session not found" };
                  }

                  const results = {};

                  if (providers.includes("google_calendar")) {
                        try {
                              const event = await googleCalendar.createCalendarEvent(sessionResult.data);
                              results.google_calendar = { success: true, eventId: event.id };
                              await db.updateTranscription({ id: sessionResult.data.transcriptionId, calendarEventId: event.id });
                        } catch (err) {
                              results.google_calendar = { success: false, error: err.message };
                        }
                  }

                  if (providers.includes("notion")) {
                        try {
                              const dbId = await notion.getSelectedDatabase();
                              if (!dbId) throw new Error("No Notion database selected");
                              const page = await notion.createPage(dbId, sessionResult.data);
                              results.notion = { success: true, pageId: page.id };
                              await db.updateTranscription({ id: sessionResult.data.transcriptionId, notionPageId: page.id });
                        } catch (err) {
                              results.notion = { success: false, error: err.message };
                        }
                  }

                  return { success: true, results };
            } catch (err) {
                  console.error("MCP sync error:", err);
                  return { success: false, error: err.message };
            }
      });
};

module.exports = {
      registerIpcHandlers,
      setMainWindow,
      setOnRecordingWindow,
};
