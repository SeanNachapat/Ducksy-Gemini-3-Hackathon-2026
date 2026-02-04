const { ipcMain, app } = require("electron");
const path = require("path");
const fs = require("fs");
const db = require("./utils/db");
const { transcribeAudio, analyzeImage } = require("./utils/gemini");
require("dotenv").config();

let mainWindow = null;
let geminiApiKey = process.env.GEMINI_API_KEY;

const setMainWindow = (window) => {
      mainWindow = window;
};

const setGeminiApiKey = (apiKey) => {
      geminiApiKey = apiKey;
};

const processTranscription = async (fileId, filePath, mimeType, userLanguage = 'en') => {
      if (!geminiApiKey) {
            console.error("Gemini API key not set");
            db.updateTranscription({
                  id: db.getTranscriptionByFileId(fileId)?.id,
                  status: "failed"
            });
            return;
      }

      try {
            db.updateTranscription({
                  id: db.getTranscriptionByFileId(fileId)?.id,
                  status: "processing"
            });

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "processing"
                  });
            }

            const audioBuffer = fs.readFileSync(filePath);
            const base64Audio = audioBuffer.toString("base64");

            const result = await transcribeAudio(base64Audio, mimeType, geminiApiKey, userLanguage);

            const transcription = db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  db.updateTranscription({
                        id: transcription.id,
                        type: result.type,
                        title: result.title,
                        summary: result.summary,
                        content: result.content,
                        language: result.language,
                        status: "completed",
                        details: result.details
                  });

                  db.updateFile({
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

            console.log(`Transcription completed for file ${fileId}`);
      } catch (error) {
            console.error(`Transcription failed for file ${fileId}:`, error);

            const transcription = db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  db.updateTranscription({
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
      }
};

const processImageAnalysis = async (fileId, filePath, mimeType) => {
      if (!geminiApiKey) {
            console.error("Gemini API key not set");
            db.updateTranscription({
                  id: db.getTranscriptionByFileId(fileId)?.id,
                  status: "failed"
            });
            return;
      }

      try {
            db.updateTranscription({
                  id: db.getTranscriptionByFileId(fileId)?.id,
                  status: "processing"
            });

            if (mainWindow && !mainWindow.isDestroyed()) {
                  mainWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "processing"
                  });
            }

            const imageBuffer = fs.readFileSync(filePath);
            const base64Image = imageBuffer.toString("base64");

            const result = await analyzeImage(base64Image, mimeType, geminiApiKey);

            const transcription = db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  db.updateTranscription({
                        id: transcription.id,
                        type: result.type,
                        title: result.title,
                        summary: result.summary,
                        content: result.content,
                        language: result.language,
                        status: "completed",
                        details: result.details
                  });

                  db.updateFile({
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

            console.log(`Image analysis completed for file ${fileId}`);
      } catch (error) {
            console.error(`Image analysis failed for file ${fileId}:`, error);

            const transcription = db.getTranscriptionByFileId(fileId);
            if (transcription) {
                  db.updateTranscription({
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
      }
};


const registerIpcHandlers = () => {
      ipcMain.handle("get-session-logs", async () => {
            try {
                  const sessionLogs = db.getSessionLogs();
                  return { success: true, data: sessionLogs };
            } catch (err) {
                  console.error("Failed to get session logs:", err);
                  return { success: false, error: err.message, data: [] };
            }
      });

      ipcMain.handle("get-session", async (event, { fileId }) => {
            try {
                  const file = db.getFileById(fileId);
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
                  const file = db.getFileById(fileId);

                  if (file) {
                        if (file.path && fs.existsSync(file.path)) {
                              fs.unlinkSync(file.path);
                              console.log(`Deleted audio file: ${file.path}`);
                        }
                        db.deleteFile(fileId);
                        console.log(`Deleted session: ${fileId}`);
                  }

                  return { success: true };
            } catch (err) {
                  console.error("Failed to delete session:", err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("save-audio-file", async (event, data) => {
            const { buffer, mimeType, duration, mode = "lens", title = "", userLanguage = "en" } = data;

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

                  // Create file record
                  const fileResult = db.createFile({
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

                  const fileId = fileResult.lastInsertRowid;

                  db.createTranscription({
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

                  processTranscription(fileId, filePath, mimeType, userLanguage);

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
            const { buffer, mimeType, width, height, title = "" } = data;

            try {
                  const timestamp = Date.now();
                  const fileName = `capture_${timestamp}.png`;
                  const fileNameWithoutExt = `capture_${timestamp}`;

                  const savePath = path.join(app.getPath("userData"), "captures");

                  if (!fs.existsSync(savePath)) {
                        fs.mkdirSync(savePath, { recursive: true });
                  }

                  const filePath = path.join(savePath, fileName);

                  // buffer comes as base64 string from renderer
                  const base64Data = buffer.replace(/^data:image\/\w+;base64,/, "");
                  const imageBuffer = Buffer.from(base64Data, "base64");
                  fs.writeFileSync(filePath, imageBuffer);

                  console.log(`Image saved: ${filePath} (${width}x${height})`);

                  // Create file record
                  const fileResult = db.createFile({
                        title: title || `Capture ${new Date().toLocaleString()}`,
                        mode: "lens",
                        description: "",
                        name: fileNameWithoutExt,
                        path: filePath,
                        size: imageBuffer.length,
                        type: mimeType || "image/png",
                        isAnalyzed: 0,
                        duration: 0
                  });

                  const fileId = fileResult.lastInsertRowid;

                  db.createTranscription({
                        fileId: fileId,
                        type: "summary",
                        title: title || `Capture ${new Date().toLocaleString()}`,
                        summary: "",
                        content: "",
                        language: "en", // Default to English or handle user language
                        status: "pending",
                        details: {},
                        calendarEventId: null,
                        notionPageId: null
                  });

                  // Notify that a new file exists (so session list updates)
                  if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send("recording-saved", {
                              fileId: fileId,
                              filePath: filePath,
                              fileName: fileName
                        });
                  }

                  // Start analysis
                  processImageAnalysis(fileId, filePath, mimeType || "image/png");

                  return {
                        success: true,
                        fileId: fileId,
                        filePath: filePath,
                        fileName: fileName
                  };
            } catch (err) {
                  console.error("Failed to save image file:", err);
                  return {
                        success: false,
                        error: err.message
                  };
            }
      });

      ipcMain.handle("update-transcription", async (event, data) => {
            const { fileId, type, title, summary, content, language, status, details } = data;

            try {
                  const transcription = db.getTranscriptionByFileId(fileId);

                  if (!transcription) {
                        return { success: false, error: "Transcription not found" };
                  }

                  db.updateTranscription({
                        id: transcription.id,
                        type: type,
                        title: title,
                        summary: summary,
                        content: content,
                        language: language,
                        status: status,
                        details: details
                  });

                  // Also update file title if provided
                  if (title) {
                        db.updateFile({
                              id: fileId,
                              title: title
                        });
                  }

                  // Notify renderer about the update
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

      // Get all files
      ipcMain.handle("get-all-files", async () => {
            try {
                  const files = db.getAllFiles();
                  return { success: true, data: files };
            } catch (err) {
                  console.error("Failed to get files:", err);
                  return { success: false, error: err.message, data: [] };
            }
      });

      // Get database size
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

      ipcMain.handle("retry-transcription", async (event, { fileId, userLanguage = "en" }) => {
            try {
                  const file = db.getFileById(fileId);
                  if (!file) {
                        return { success: false, error: "File not found" };
                  }

                  processTranscription(fileId, file.path, file.type, userLanguage);
                  return { success: true };
            } catch (err) {
                  console.error("Failed to retry transcription:", err);
                  return { success: false, error: err.message };
            }
      });
};

module.exports = {
      registerIpcHandlers,
      setMainWindow,
};
