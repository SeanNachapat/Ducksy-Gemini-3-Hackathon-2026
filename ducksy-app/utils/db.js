const Database = require("better-sqlite3");
const { app, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const getDBPath = () => {
      const dbPath = app?.getPath?.("userData") || "./data";
      return path.join(dbPath, "ducksy.db");
};

const isAlreadyFile = async () => {
      const getPath = getDBPath();
      return fs.existsSync(getPath);
};

let db = null;

const initializeDatabase = () => {
      if (db) return db;

      const getPath = getDBPath();
      db = new Database(getPath);
      console.log("Database is Initialized at click to open file" + getPath);

      const migrateTranscriptions = () => {
            try {
                  const tableInfo = db.prepare("PRAGMA table_info(transcriptions)").all();
                  const columns = tableInfo.map(col => col.name);

                  if (!columns.includes("type")) {
                        db.exec(`ALTER TABLE transcriptions ADD COLUMN type TEXT DEFAULT 'summary' CHECK(type IN ('summary', 'chat', 'debug'))`);
                        console.log("Migration: Added 'type' column to transcriptions");
                  }

                  if (!columns.includes("title")) {
                        db.exec(`ALTER TABLE transcriptions ADD COLUMN title TEXT DEFAULT ''`);
                        console.log("Migration: Added 'title' column to transcriptions");
                  }

                  if (!columns.includes("details")) {
                        db.exec(`ALTER TABLE transcriptions ADD COLUMN details TEXT DEFAULT '{}'`);
                        console.log("Migration: Added 'details' column to transcriptions");
                  }

                  if (!columns.includes("chatHistory")) {
                        db.exec(`ALTER TABLE transcriptions ADD COLUMN chatHistory TEXT DEFAULT '[]'`);
                        console.log("Migration: Added 'chatHistory' column to transcriptions");
                  }
            } catch (err) {
                  console.log("Migration skipped: transcriptions table not found yet");
            }

            try {
                  const fileTableInfo = db.prepare("PRAGMA table_info(files)").all();
                  const fileColumns = fileTableInfo.map(col => col.name);

                  if (!fileColumns.includes("metadata")) {
                        db.exec(`ALTER TABLE files ADD COLUMN metadata TEXT DEFAULT '{}'`);
                        console.log("Migration: Added 'metadata' column to files");
                  }
            } catch (err) {
                  console.log("Migration skipped: files table not found yet");
            }
      };

      migrateTranscriptions();

      db.exec(`
            CREATE TABLE IF NOT EXISTS mcp_credentials (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  provider TEXT NOT NULL CHECK(provider IN ('google_calendar', 'notion')),
                  access_token TEXT,
                  refresh_token TEXT,
                  client_id TEXT,
                  client_secret TEXT,
                  additional_info TEXT,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
      `);

      db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                  key TEXT PRIMARY KEY,
                  value TEXT
            )
      `);

      db.exec(`
            CREATE TABLE IF NOT EXISTS files (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  mode TEXT NOT NULL CHECK(mode IN ('ghost', 'lens')),
                  description TEXT DEFAULT '',
                  name TEXT NOT NULL,
                  path TEXT NOT NULL,
                  size INTEGER NOT NULL,
                  duration INTEGER NOT NULL,
                  type TEXT NOT NULL,
                  metadata TEXT DEFAULT '{}',
                  isAnalyzed BOOLEAN DEFAULT 0,
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )      
      `);

      db.exec(`
            CREATE TABLE IF NOT EXISTS transcriptions (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  fileId INTEGER NOT NULL,
                  type TEXT NOT NULL DEFAULT 'summary' CHECK(type IN ('summary', 'chat', 'debug')),
                  title TEXT NOT NULL DEFAULT '',
                  summary TEXT DEFAULT '',
                  content TEXT NOT NULL,
                  language TEXT NOT NULL,
                  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
                  details TEXT DEFAULT '{}',
                  chatHistory TEXT DEFAULT '[]',
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  calendarEventId TEXT,
                  notionPageId TEXT,
                  FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE
            )
      `);

      return db;
};

const createFile = (file) => {
      const stmt = db.prepare(`
            INSERT INTO files (title, mode, description, name, path, size, type, isAnalyzed, duration, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
            file.title,
            file.mode,
            file.description,
            file.name,
            file.path,
            file.size,
            file.type,
            file.isAnalyzed,
            file.duration,
            JSON.stringify(file.metadata || {})
      );
};

const getSizeOfdb = async () => {
      const getPath = getDBPath();
      const size = fs.statSync(getPath).size;
      const mb = size / 1024 / 1024;
      return mb;
};

const createTranscription = (transcription) => {
      const stmt = db.prepare(`
            INSERT INTO transcriptions (fileId, type, title, summary, content, language, status, details, calendarEventId, notionPageId)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
            transcription.fileId,
            transcription.type || "summary",
            transcription.title || "",
            transcription.summary || "",
            transcription.content,
            transcription.language,
            transcription.status,
            JSON.stringify(transcription.details || {}),
            transcription.calendarEventId || null,
            transcription.notionPageId || null
      );
};

const updateTranscription = (transcription) => {
      const fields = [];
      const values = [];

      if (transcription.type !== undefined) {
            fields.push("type = ?");
            values.push(transcription.type);
      }

      if (transcription.title !== undefined) {
            fields.push("title = ?");
            values.push(transcription.title);
      }

      if (transcription.summary !== undefined) {
            fields.push("summary = ?");
            values.push(transcription.summary);
      }

      if (transcription.content !== undefined) {
            fields.push("content = ?");
            values.push(transcription.content);
      }

      if (transcription.language !== undefined) {
            fields.push("language = ?");
            values.push(transcription.language);
      }

      if (transcription.status !== undefined) {
            fields.push("status = ?");
            values.push(transcription.status);
      }

      if (transcription.details !== undefined) {
            fields.push("details = ?");
            values.push(JSON.stringify(transcription.details));
      }

      if (transcription.chatHistory !== undefined) {
            fields.push("chatHistory = ?");
            values.push(JSON.stringify(transcription.chatHistory));
      }

      if (transcription.calendarEventId !== undefined) {
            fields.push("calendarEventId = ?");
            values.push(transcription.calendarEventId);
      }

      if (transcription.notionPageId !== undefined) {
            fields.push("notionPageId = ?");
            values.push(transcription.notionPageId);
      }

      fields.push("updatedAt = CURRENT_TIMESTAMP");
      values.push(transcription.id);

      const stmt = db.prepare(`UPDATE transcriptions SET ${fields.join(", ")} WHERE id = ?`);
      return stmt.run(...values);
};

const getAllFiles = () => {
      const stmt = db.prepare(`
            SELECT 
                  f.*, 
                  t.id as transcriptionId, 
                  t.type as transcriptionType,
                  t.title as transcriptionTitle,
                  t.status as transcriptionStatus, 
                  t.summary as transcriptionSummary, 
                  t.content as transcriptionContent, 
                  t.language as transcriptionLanguage, 
                  t.details as transcriptionDetails,
                  t.chatHistory as transcriptionChatHistory,
                  t.calendarEventId, 
                  t.notionPageId, 
                  t.createdAt as transcriptionCreatedAt, 
                  t.updatedAt as transcriptionUpdatedAt
            FROM files f
            LEFT JOIN transcriptions t ON f.id = t.fileId
            ORDER BY f.createdAt DESC
      `);
      return stmt.all();
};

const getSessionLogs = () => {
      const files = getAllFiles();

      return files.map((file) => {
            let details = {};
            try {
                  details = file.transcriptionDetails ? JSON.parse(file.transcriptionDetails) : {};
            } catch (e) {
                  details = {};
            }

            let chatHistory = [];
            try {
                  chatHistory = file.transcriptionChatHistory ? JSON.parse(file.transcriptionChatHistory) : [];
            } catch (e) {
                  chatHistory = [];
            }

            const createdAt = new Date(file.createdAt);
            const now = new Date();
            const diffMs = now - createdAt;
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

            let timeAgo;
            if (diffMinutes < 1) {
                  timeAgo = "Just now";
            } else if (diffMinutes < 60) {
                  timeAgo = `${diffMinutes}m ago`;
            } else if (diffHours < 24) {
                  timeAgo = `${diffHours}h ago`;
            } else if (diffDays === 1) {
                  timeAgo = "Yesterday";
            } else if (diffDays < 7) {
                  timeAgo = `${diffDays}d ago`;
            } else {
                  timeAgo = createdAt.toLocaleDateString();
            }

            const type = file.transcriptionType || details.type || "summary";
            const subtitlePrefix = type === "debug" ? "Debug Session" : "Meeting Summary";

            return {
                  id: file.id,
                  fileId: file.id,
                  transcriptionId: file.transcriptionId,
                  type: type,
                  title: file.transcriptionTitle || file.title,
                  subtitle: `${subtitlePrefix} • ${timeAgo}`,
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
                  chatHistory: chatHistory,
                  transcriptionStatus: file.transcriptionStatus,
                  duration: file.duration,
                  filePath: file.path,
                  createdAt: file.createdAt,
                  updatedAt: file.updatedAt
            };
      });
};

const getAllTranscriptions = () => {
      const stmt = db.prepare(`SELECT * FROM transcriptions`);
      return stmt.all();
};

const updateFile = (value) => {
      const fields = [];
      const values = [];

      if (value.title) {
            fields.push("title = ?");
            values.push(value.title);
      }

      if (value.description) {
            fields.push("description = ?");
            values.push(value.description);
      }

      if (value.name) {
            fields.push("name = ?");
            values.push(value.name);
      }

      if (value.path) {
            fields.push("path = ?");
            values.push(value.path);
      }

      if (value.size) {
            fields.push("size = ?");
            values.push(value.size);
      }

      if (value.type) {
            fields.push("type = ?");
            values.push(value.type);
      }

      if (value.isAnalyzed !== undefined) {
            fields.push("isAnalyzed = ?");
            values.push(value.isAnalyzed);
      }

      if (value.mode) {
            fields.push("mode = ?");
            values.push(value.mode);
      }

      fields.push("updatedAt = CURRENT_TIMESTAMP");
      values.push(value.id);

      const stmt = db.prepare(`UPDATE files SET ${fields.join(", ")} WHERE id = ?`);
      return stmt.run(...values);
};

const deleteFile = (id) => {
      const stmt = db.prepare(`DELETE FROM files WHERE id = ?`);
      return stmt.run(id);
};

const deleteTranscription = (id) => {
      const stmt = db.prepare(`DELETE FROM transcriptions WHERE id = ?`);
      return stmt.run(id);
};

const getTranscriptionByFileId = (fileId) => {
      const stmt = db.prepare(`SELECT * FROM transcriptions WHERE fileId = ?`);
      return stmt.get(fileId);
};

const getFileById = (id) => {
      const stmt = db.prepare(`
            SELECT 
                  f.*, 
                  t.id as transcriptionId, 
                  t.type as transcriptionType,
                  t.title as transcriptionTitle,
                  t.status as transcriptionStatus, 
                  t.summary as transcriptionSummary, 
                  t.content as transcriptionContent, 
                  t.language as transcriptionLanguage, 
                  t.details as transcriptionDetails,
                  t.chatHistory as transcriptionChatHistory,
                  t.calendarEventId, 
                  t.notionPageId
            FROM files f
            LEFT JOIN transcriptions t ON f.id = t.fileId
            WHERE f.id = ?
      `);
      return stmt.get(id);
};

const deleteDb = () => {
      try {
            if (db) {
                  db.close();
                  db = null;
            }

            const dbPath = getDBPath();
            if (fs.existsSync(dbPath)) {
                  fs.unlinkSync(dbPath);
            }

            const userDataPath = app?.getPath?.("userData") || "./data";
            const recordingsPath = path.join(userDataPath, "recordings");

            if (fs.existsSync(recordingsPath)) {
                  fs.rmSync(recordingsPath, { recursive: true, force: true });
                  console.log("Recordings folder deleted:", recordingsPath);
            }

            return {
                  status: "success",
                  message: "Database and recordings deleted successfully"
            }
      } catch (error) {
            console.error("Delete error:", error);
            return {
                  status: "error",
                  message: error.message
            }
      }
};

module.exports = {
      initializeDatabase,
      isAlreadyFile,
      createFile,
      createTranscription,
      updateTranscription,
      getAllFiles,
      getAllTranscriptions,
      getSessionLogs,
      updateFile,
      deleteFile,
      deleteTranscription,
      getTranscriptionByFileId,
      getFileById,
      getSizeOfdb,
      deleteDb
};