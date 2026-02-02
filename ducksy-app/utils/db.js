const Database = require("better-sqlite3");
const { app } = require("electron");
const path = require("path")
const fs = require("fs")

const getDBPath = () => {
      const dbPath = app?.getPath?.("userData") || './data'
      return path.join(dbPath, "ducksy.db")
}
const isAlreadyFile = async () => {
      const getPath = getDBPath();
      return fs.existsSync(getPath);
}

let db = null;

const initializeDatabase = () => {
      if (db) return db;

      const getPath = getDBPath();
      db = new Database(getPath);
      db.exec(`
            CREATE TABLE IF NOT EXISTS mcp_credentials (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  provider TEXT NOT NULL CHECK(provider IN ('google_calendar', 'notion')), -- แยกประเภท
                  access_token TEXT,      -- ใช้สำหรับ Google และ Notion
                  refresh_token TEXT,     -- จำเป็นมากสำหรับ Google (เพราะ access_token หมดอายุเร็ว)
                  client_id TEXT,         -- (Optional) ถ้าต้องการเก็บแยกราย User
                  client_secret TEXT,     -- (Optional) ถ้าต้องการเก็บแยกราย User
                  additional_info TEXT,   -- เก็บ JSON เผื่อมีค่าอื่น ๆ
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
      `);

      db.exec(`
            CREATE TABLE IF NOT EXISTS settings (
                  key TEXT PRIMARY KEY,
                  value TEXT
            )
      `)

      db.exec(`
            CREATE TABLE IF NOT EXISTS files (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  mode TEXT NOT NULL CHECK(mode IN ('ghost', 'lens')),
                  description TEXT DEFAULT '',
                  name TEXT NOT NULL,
                  path TEXT NOT NULL,
                  size INTEGER NOT NULL,
                  type TEXT NOT NULL CHECK(type IN ('image', 'voice')),
                  isAnalyzed BOOLEAN DEFAULT 0,
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )      
      `)

      db.exec(`
            CREATE TABLE IF NOT EXISTS transcriptions (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  fileId INTEGER NOT NULL,
                  summary TEXT NOT NULL,
                  content TEXT NOT NULL,
                  language TEXT NOT NULL,
                  status TEXT NOT NULL CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
                  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                  calendarEventId TEXT,
                  notionPageId TEXT,
                  FOREIGN KEY (fileId) REFERENCES files(id) ON DELETE CASCADE
            )
      `)

      return db;
}

const createFile = (file) => {
      const stmt = db.prepare(`
            INSERT INTO files (title, description, name, path, size, type, isAnalyzed)
            VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      return stmt.run(file.title, file.description, file.name, file.path, file.size, file.type, file.isAnalyzed)
}

const getSizeOfdb = async () => {
      const getPath = getDBPath();
      const size = fs.statSync(getPath).size;
      // To Mb
      const mb = size / 1024 / 1024;
      return mb;
}

const createTranscription = (transcription) => {
      const stmt = db.prepare(`
            INSERT INTO transcriptions (fileId, summary, content, language, status, calendarEventId, notionPageId)
            VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      return stmt.run(transcription.fileId, transcription.summary, transcription.content, transcription.language, transcription.status, transcription.calendarEventId, transcription.notionPageId)
}

const getAllFiles = () => {
      const stmt = db.prepare(`
            SELECT f.*, t.id as transcriptionId, t.status as transcriptionStatus, t.summary as transcriptionSummary, t.content as transcriptionContent, t.language as transcriptionLanguage, t.calendarEventId, t.notionPageId, t.createdAt as transcriptionCreatedAt, t.updatedAt as transcriptionUpdatedAt
            FROM files f
            LEFT JOIN transcriptions t ON f.id = t.fileId
            ORDER BY f.createdAt DESC
      `)
      return stmt.all()
}

const getAllTranscriptions = () => {
      const stmt = db.prepare(`SELECT * FROM transcriptions`)
      return stmt.all()
}

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

      if (value.isAnalyzed) {
            fields.push("isAnalyzed = ?");
            values.push(value.isAnalyzed);
      }

      fields.push("updatedAt = CURRENT_TIMESTAMP");
      values.push(value.id);

      const stmt = db.prepare(`UPDATE files SET ${fields.join(", ")} WHERE id = ?`);
      return stmt.run(...values);
}

const deleteFile = (id) => {
      const stmt = db.prepare(`DELETE FROM files WHERE id = ?`);
      return stmt.run(id);
}

const getTranscriptionByFileId = (fileId) => {
      const stmt = db.prepare(`SELECT * FROM transcriptions WHERE fileId = ?`);
      return stmt.get(fileId);
}

module.exports = {
      initializeDatabase,
      isAlreadyFile,
      createFile,
      createTranscription,
      getAllFiles,
      getAllTranscriptions,
      updateFile,
      deleteFile,
      getTranscriptionByFileId,
      getSizeOfdb
};