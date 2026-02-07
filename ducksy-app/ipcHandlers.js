const { ipcMain, app, shell, BrowserWindow } = require("electron");
const path = require("path");
const fs = require("fs");
const db = require("./utils/db");
const { getSessionData } = require("./utils/sessionHelper");
const { transcribeAudio, analyzeImage, chatWithSession, getMetrics } = require("./utils/gemini");
require("dotenv").config();

const SERVER_URL = 'http://localhost:8080';

// OAuth window helper - opens OAuth in a popup and intercepts the callback
async function openOAuthWindow(authUrl, provider) {
      return new Promise((resolve, reject) => {
            const authWindow = new BrowserWindow({
                  width: 600,
                  height: 700,
                  show: true,
                  title: `Connect ${provider}`,
                  webPreferences: {
                        nodeIntegration: false,
                        contextIsolation: true
                  }
            });

            authWindow.loadURL(authUrl);

            // Intercept navigation to catch the callback
            authWindow.webContents.on('will-redirect', async (event, url) => {
                  console.log('OAuth redirect:', url);

                  // Check if this is our callback URL with ducksy:// or token_id
                  if (url.includes('token_id=') || url.startsWith('ducksy://')) {
                        event.preventDefault();

                        try {
                              const parsed = new URL(url.startsWith('ducksy://') ? url : url);
                              const tokenId = parsed.searchParams.get('token_id');

                              if (tokenId) {
                                    console.log('Fetching token with ID:', tokenId);
                                    const response = await fetch(`${SERVER_URL}/auth/token/${tokenId}`);

                                    if (response.ok) {
                                          const tokenData = await response.json();
                                          await db.saveMcpCredential(
                                                provider,
                                                tokenData.access_token,
                                                tokenData.refresh_token || null,
                                                null,
                                                null,
                                                JSON.stringify(tokenData)
                                          );
                                          console.log('OAuth token saved for', provider);

                                          // Notify main window
                                          if (mainWindow && !mainWindow.isDestroyed()) {
                                                mainWindow.webContents.send('mcp-auth-success', { provider });
                                          }

                                          resolve({ success: true });
                                    } else {
                                          reject(new Error('Failed to fetch token'));
                                    }
                              }
                        } catch (err) {
                              console.error('OAuth callback error:', err);
                              reject(err);
                        } finally {
                              authWindow.close();
                        }
                  }
            });

            authWindow.on('closed', () => {
                  resolve({ success: false, cancelled: true });
            });
      });
}

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
                        details: result.details,
                        calendarEvent: result.calendarEvent
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
                        details: result.details,
                        calendarEvent: result.calendarEvent
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "completed",
                        title: result.title,
                        details: result.details,
                        calendarEvent: result.calendarEvent
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

            console.log(`Starting image analysis for file ${fileId}...`);
            const result = await analyzeImage(base64Image, mimeType, geminiApiKey, null, metadata, userLanguage, settings);
            console.log(`Image analysis result received for file ${fileId}`);

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
                        details: result.details,
                        calendarEvent: result.calendarEvent
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
                        details: result.details,
                        calendarEvent: result.calendarEvent
                  });
            }

            if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                  onRecordingWindow.webContents.send("transcription-updated", {
                        fileId: fileId,
                        status: "completed",
                        title: result.title,
                        details: result.details,
                        calendarEvent: result.calendarEvent
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
                        mimeType: file.type,
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

      ipcMain.handle("confirm-action-item", async (event, { fileId, index, eventDetails }) => {
            try {
                  const transcription = await db.getTranscriptionByFileId(fileId);
                  if (!transcription) {
                        return { success: false, error: "Transcription not found" };
                  }

                  let details = {};
                  try {
                        details = transcription.details ? JSON.parse(transcription.details) : {};
                  } catch (e) {
                        details = {};
                  }

                  if (!details.actionItems || !Array.isArray(details.actionItems)) {
                        return { success: false, error: "No action items found" };
                  }

                  if (index < 0 || index >= details.actionItems.length) {
                        return { success: false, error: "Invalid action item index" };
                  }

                  // Migrate string to object if needed
                  let item = details.actionItems[index];
                  if (typeof item === 'string') {
                        item = {
                              description: item,
                              confirmed: true,
                              calendarEvent: eventDetails,
                              tool: null,
                              parameters: {}
                        };
                  } else if (typeof item === 'object') {
                        item.confirmed = true;
                        item.calendarEvent = eventDetails;
                  }

                  details.actionItems[index] = item;

                  await db.updateTranscription({
                        id: transcription.id,
                        details: details
                  });

                  // Notify frontend
                  if (mainWindow && !mainWindow.isDestroyed()) {
                        mainWindow.webContents.send("transcription-updated", {
                              fileId: fileId,
                              status: transcription.status,
                              title: transcription.title,
                              details: details
                        });
                  }

                  return { success: true };
            } catch (err) {
                  console.error("Failed to confirm action item:", err);
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

                  const transcription = await db.getTranscriptionByFileId(fileId);
                  if (transcription) {
                        await db.updateTranscription({
                              id: transcription.id,
                              status: "processing"
                        });
                  }

                  console.log(`Retrying transcription for file: ${fileId}`);
                  if (file.type && file.type.startsWith("image/")) {
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

                  // Check for tool call in response
                  const toolCallRegex = /```json\s*({[\s\S]*?"tool":\s*"addActionItem"[\s\S]*?})\s*```/;
                  const match = responseText.match(toolCallRegex);
                  let finalResponse = responseText;

                  if (match) {
                        try {
                              const toolCall = JSON.parse(match[1]);
                              if (toolCall.params) {
                                    console.log("Processing addActionItem tool call:", toolCall.params);

                                    // Get current session details
                                    let currentDetails = {};
                                    try {
                                          currentDetails = transcription.details ? JSON.parse(transcription.details) : {};
                                    } catch (e) { }

                                    const currentActionItems = currentDetails.actionItems || [];

                                    // Add new action item
                                    const newItem = {
                                          text: toolCall.params.text,
                                          type: toolCall.params.type || 'task',
                                          isActionable: true,
                                          calendarEvent: toolCall.params.calendarEvent
                                    };

                                    // Update DB
                                    const updatedDetails = {
                                          ...currentDetails,
                                          actionItems: [...currentActionItems, newItem]
                                    };

                                    await db.updateTranscription({
                                          id: transcription.id,
                                          details: JSON.stringify(updatedDetails)
                                    });

                                    // Notify frontend
                                    if (mainWindow && !mainWindow.isDestroyed()) {
                                          mainWindow.webContents.send("transcription-updated", {
                                                fileId: fileId,
                                                status: "completed",
                                                details: updatedDetails
                                          });
                                    }

                                    // Also notify recording window if open
                                    if (onRecordingWindow && !onRecordingWindow.isDestroyed()) {
                                          onRecordingWindow.webContents.send("transcription-updated", {
                                                fileId: fileId,
                                                status: "completed",
                                                details: updatedDetails
                                          });
                                    }

                                    // Clean up response to remove the JSON block
                                    finalResponse = responseText.replace(match[0], '').trim();
                              }
                        } catch (e) {
                              console.error("Failed to process tool call:", e);
                        }
                  }

                  const newHistory = [
                        ...chatHistory,
                        { role: 'user', content: message, timestamp: Date.now() },
                        { role: 'model', content: finalResponse, timestamp: Date.now() }
                  ];

                  await db.updateTranscription({
                        id: transcription.id,
                        chatHistory: JSON.stringify(newHistory)
                  });

                  return { success: true, response: finalResponse, history: newHistory };

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

      ipcMain.handle("get-system-metrics", async () => {
            try {
                  const metrics = getMetrics();
                  return { success: true, data: metrics };
            } catch (err) {
                  console.error("Failed to get system metrics:", err);
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
                  const google = await db.getMcpCredential("google_calendar");
                  const notion = await db.getMcpCredential("notion");
                  return {
                        success: true,
                        google_calendar: { connected: !!(google && google.access_token) },
                        notion: { connected: !!(notion && notion.access_token) }
                  };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("mcp-open-google-auth", async () => {
            return openOAuthWindow(`${SERVER_URL}/auth/google`, 'google_calendar');
      });

      ipcMain.handle("mcp-open-notion-auth", async () => {
            return openOAuthWindow(`${SERVER_URL}/auth/notion`, 'notion');
      });

      ipcMain.handle("mcp-disconnect", async (event, { provider }) => {
            try {
                  await db.deleteMcpCredential(provider);
                  return { success: true };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("calendar-create-event", async (event, { title, description, startTime, endTime }) => {
            try {
                  const credential = await db.getMcpCredential('google_calendar');
                  if (!credential || !credential.access_token) {
                        return { success: false, error: 'Google Calendar not connected' };
                  }

                  const response = await fetch(`${SERVER_URL}/calendar/create`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                              title,
                              description,
                              startTime,
                              endTime,
                              accessToken: credential.access_token,
                              refreshToken: credential.refresh_token
                        })
                  });

                  const data = await response.json();
                  if (!response.ok) {
                        throw new Error(data.error || 'Failed to create event');
                  }

                  return { success: true, eventLink: data.eventLink };
            } catch (err) {
                  console.error('Calendar create error:', err);
                  return { success: false, error: err.message };
            }
      });

      ipcMain.handle("calendar-dismiss-event", async (event, { fileId, index }) => {
            try {
                  const transcription = await db.getTranscriptionByFileId(fileId);
                  console.log(`[Dismiss] Processing fileId: ${fileId}, item index: ${index}. Transcription found: ${!!transcription}`);

                  if (!transcription) return { success: false, error: 'Transcription not found' };

                  let calendarEvent = {};
                  let details = {};
                  try {
                        calendarEvent = JSON.parse(transcription.calendarEvent || '{}');
                        details = transcription.details ? JSON.parse(transcription.details) : {};
                        console.log(`[Dismiss] Current calendarEvent:`, calendarEvent);
                  } catch (e) {
                        calendarEvent = {};
                        details = {};
                        console.error(`[Dismiss] Parse error:`, e);
                  }

                  // 1. Mark main calendar event as dismissed (only if no index provided or if it's the root event)
                  if (index === undefined || index === -1) {
                        calendarEvent.dismissed = true;
                  }

                  // 2. Mark specific action item as dismissed
                  if (details.actionItems && Array.isArray(details.actionItems)) {
                        if (index !== undefined && index >= 0 && index < details.actionItems.length) {
                              details.actionItems[index] = {
                                    ...details.actionItems[index],
                                    dismissed: true,
                                    confirmed: false
                              };

                              // If this was an event and matches the main root event, dismiss that too
                              if (details.actionItems[index].calendarEvent && calendarEvent.detected) {
                                    // Simplified check: if titles match or if it's the only one
                                    if (details.actionItems[index].calendarEvent.title === calendarEvent.title) {
                                          calendarEvent.dismissed = true;
                                    }
                              }
                        } else {
                              // Fallback: dismiss all items with calendar events (legacy/catch-all)
                              details.actionItems = details.actionItems.map(item => {
                                    if (typeof item === 'object' && item !== null && item.calendarEvent) {
                                          return { ...item, dismissed: true, confirmed: false };
                                    }
                                    return item;
                              });
                        }
                  }

                  console.log(`[Dismiss] Updating transcription ${transcription.id} with dismissed=true`);

                  await db.updateTranscription({
                        id: transcription.id,
                        calendarEvent: calendarEvent,
                        details: details
                  });

                  console.log(`[Dismiss] Update complete`);

                  if (mainWindow) {
                        mainWindow.webContents.send("transcription-updated", {
                              fileId: fileId,
                              calendarEvent: calendarEvent,
                              details: details
                        });
                  }

                  return { success: true };
            } catch (err) {
                  return { success: false, error: err.message };
            }
      });
};

module.exports = {
      registerIpcHandlers,
      setMainWindow,
      setOnRecordingWindow,
};
