const express = require('express');
const gemini = require('../utils/gemini');
const router = express.Router();

const getApiKey = () => {
      const key = process.env.GEMINI_API_KEY;
      if (!key || key === 'your_gemini_api_key_here') {
            throw new Error('GEMINI_API_KEY not configured');
      }
      return key;
};

router.post('/transcribe', async (req, res) => {
      try {
            const { base64Audio, mimeType, userLanguage, settings } = req.body;
            if (!base64Audio || !mimeType) {
                  return res.status(400).json({ error: 'Missing base64Audio or mimeType' });
            }

            const apiKey = getApiKey();
            const result = await gemini.transcribeAudio(base64Audio, mimeType, apiKey, userLanguage, settings);
            res.json({ success: true, data: result });
      } catch (error) {
            console.error('Transcribe error:', error);
            res.status(500).json({ error: error.message });
      }
});

router.post('/analyze', async (req, res) => {
      try {
            const { base64Image, mimeType, customPrompt, metadata, userLanguage, settings } = req.body;
            if (!base64Image || !mimeType) {
                  return res.status(400).json({ error: 'Missing base64Image or mimeType' });
            }

            const apiKey = getApiKey();
            const result = await gemini.analyzeImage(base64Image, mimeType, apiKey, customPrompt, metadata, userLanguage, settings);
            res.json({ success: true, data: result });
      } catch (error) {
            console.error('Analyze error:', error);
            res.status(500).json({ error: error.message });
      }
});

router.post('/chat', async (req, res) => {
      try {
            const { context, history, message, settings } = req.body;
            if (!context || !message) {
                  return res.status(400).json({ error: 'Missing context or message' });
            }

            const apiKey = getApiKey();
            const result = await gemini.chatWithSession(context, history || [], message, apiKey, settings);
            res.json({ success: true, data: result });
      } catch (error) {
            console.error('Chat error:', error);
            res.status(500).json({ error: error.message });
      }
});

router.get('/metrics', (req, res) => {
      res.json(gemini.getMetrics());
});

module.exports = router;
