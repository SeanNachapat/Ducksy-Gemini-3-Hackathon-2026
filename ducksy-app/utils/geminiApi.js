/**
 * Gemini API Client - HTTP wrapper for calling ducksy-server Gemini endpoints
 */

const getServerUrl = () => {
      // Check if we're in production (packaged app) or development
      const isProd = process.env.NODE_ENV === 'production' || !process.env.NODE_ENV;
      return isProd
            ? 'https://ducksy-gemini-3-hackathon-2026.onrender.com'
            : 'http://localhost:8080';
};

/**
 * Transcribe audio using Gemini API via server
 */
async function transcribeAudio(base64Audio, mimeType, apiKey, userLanguage = 'en', settings = {}) {
      const serverUrl = getServerUrl();

      const response = await fetch(`${serverUrl}/api/transcribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                  base64Audio,
                  mimeType,
                  userLanguage,
                  settings
            })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
            throw new Error(result.error || `HTTP ${response.status}: Transcription failed`);
      }

      return result.data;
}

/**
 * Analyze image using Gemini API via server
 */
async function analyzeImage(base64Image, mimeType, apiKey, customPrompt = null, metadata = null, userLanguage = 'en', settings = {}) {
      const serverUrl = getServerUrl();

      const response = await fetch(`${serverUrl}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                  base64Image,
                  mimeType,
                  customPrompt,
                  metadata,
                  userLanguage,
                  settings
            })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
            throw new Error(result.error || `HTTP ${response.status}: Image analysis failed`);
      }

      return result.data;
}

/**
 * Chat with session context using Gemini API via server
 */
async function chatWithSession(context, history, userMessage, apiKey, settings = {}) {
      const serverUrl = getServerUrl();

      const response = await fetch(`${serverUrl}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                  context,
                  history,
                  message: userMessage,
                  settings
            })
      });

      const result = await response.json();

      if (!response.ok || result.error) {
            throw new Error(result.error || `HTTP ${response.status}: Chat failed`);
      }

      return result.data;
}

/**
 * Get Gemini API metrics from server
 */
async function getMetrics() {
      const serverUrl = getServerUrl();

      try {
            const response = await fetch(`${serverUrl}/api/metrics`);
            const result = await response.json();
            return result;
      } catch (error) {
            return {
                  latency: 0,
                  tokensUsed: 0,
                  tokensTotal: 1000000,
                  mcpConnected: false,
                  lastUpdated: Date.now()
            };
      }
}

module.exports = {
      transcribeAudio,
      analyzeImage,
      chatWithSession,
      getMetrics
};
