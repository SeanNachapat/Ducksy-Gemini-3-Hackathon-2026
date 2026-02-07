const db = require("./db");
const fs = require("fs");

const getSessionData = async (fileId) => {
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

        let chatHistory = [];
        try {
            chatHistory = file.transcriptionChatHistory ? JSON.parse(file.transcriptionChatHistory) : [];
        } catch (e) {
            chatHistory = [];
        }

        let calendarEvent = null;
        try {
            calendarEvent = file.transcriptionCalendarEvent ? JSON.parse(file.transcriptionCalendarEvent) : null;
        } catch (e) {
            calendarEvent = null;
        }

        const fileExists = fs.existsSync(file.path);

        const session = {
            id: file.id,
            fileId: file.id,
            transcriptionId: file.transcriptionId,
            type: file.transcriptionType || details.type || "summary",
            title: file.transcriptionTitle || file.title,
            mode: file.mode === "ghost" ? "Ghost Mode" : "Lens Mode",
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
            calendarEvent: calendarEvent,
            chatHistory: chatHistory,
            transcriptionStatus: file.transcriptionStatus,
            duration: file.duration,
            filePath: file.path,
            mimeType: file.type,
            fileExists: fileExists,
            createdAt: file.createdAt
        };

        return { success: true, data: session };
    } catch (err) {
        console.error("Failed to get session:", err);
        return { success: false, error: err.message };
    }
};

module.exports = {
    getSessionData
};
