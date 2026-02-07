const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

const metrics = {
      latency: 0,
      tokensUsed: 0,
      tokensTotal: 1000000,
      mcpConnected: true,
      lastUpdated: Date.now()
};

const getMetrics = () => ({ ...metrics });

const LANGUAGE_NAMES = {
      'en': 'English',
      'th': 'Thai',
      'zh': 'Chinese',
      'ja': 'Japanese'
};

const getOutputLanguage = (langCode) => LANGUAGE_NAMES[langCode] || 'English';

const getPersonaInstructions = (settings = {}) => {
      const personality = settings.personality ?? 50;
      const responses = settings.responses ?? 50;

      let styleInstruction = "Tone: Professional and balanced.";
      if (personality < 30) styleInstruction = "Tone: Strict, formal, and objective.";
      else if (personality > 70) styleInstruction = "Tone: Creative, casual, and engaging.";

      let lengthInstruction = "Response Style: Standard detailed.";
      if (responses < 30) lengthInstruction = "Response Style: Extremely concise and to the point.";
      else if (responses > 70) lengthInstruction = "Response Style: Detailed, comprehensive, and verbose.";

      return `PERSONA SETTINGS:\n${styleInstruction}\n${lengthInstruction}`;
};

const getCommonLanguageInstructions = (outputLanguage) => `
CRITICAL INSTRUCTIONS:
1. The input content may be in ANY language (English, Thai, Chinese, Japanese, or others).
2. You MUST understand and analyze the content regardless of input language.
3. You MUST translate and output ALL text content in ${outputLanguage} language.
4. Even if the input is in a different language, your entire output must be in ${outputLanguage}.
`;

const getBaseJsonStructure = (outputLanguage, userLanguage) => `
Output Format: JSON object with this exact structure:
{
    "type": "summary" | "debug",
    "title": "Clear descriptive title translated to ${outputLanguage}",
    "summary": "Comprehensive summary/description translated to ${outputLanguage}",
    "language": "${userLanguage}",
    "content": "Full transcription/extracted text translated to ${outputLanguage}...",
    "details": {
        "topic": "Main topic/subject translated to ${outputLanguage}",
        "actionItems": ["Action item 1", "Action item 2"],
        "bug": "Bug description if debug type",
        "fix": "Solution description if debug type",
        "code": "Code snippet if any"
    }
}

Rules:
- "type" must be exactly one of: "summary", "debug"
- "actionItems" should be an array (empty array [] if none)
- "language" must be "${userLanguage}"
- ALL text fields MUST be translated to ${outputLanguage}
- Return ONLY the JSON object, no markdown code blocks
`;

async function generateContent(apiKey, modelId, contents, generationConfig = {}) {
      const startTime = Date.now();

      const response = await fetch(
            `${GEMINI_API_URL}/${modelId}:generateContent?key=${apiKey}`,
            {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                        contents,
                        generationConfig: {
                              temperature: 0.1,
                              topK: 32,
                              topP: 1,
                              maxOutputTokens: 8192,
                              ...generationConfig
                        },
                  }),
            }
      );

      metrics.latency = Date.now() - startTime;
      metrics.lastUpdated = Date.now();
      metrics.mcpConnected = response.ok;

      if (!response.ok) {
            metrics.mcpConnected = false;
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `HTTP ${response.status}: Failed to generate content`);
      }

      const result = await response.json();

      if (result.usageMetadata) {
            metrics.tokensUsed += result.usageMetadata.totalTokenCount || 0;
      }

      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
            const blockReason = result.candidates?.[0]?.finishReason;
            if (blockReason && blockReason !== 'STOP') {
                  throw new Error(`Gemini blocked the response: ${blockReason}`);
            }
            throw new Error('No response from Gemini');
      }

      return text;
}

function cleanAndParseJson(text) {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim();

      try {
            return JSON.parse(cleanText);
      } catch (parseErr) {
            const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
            }
            throw new Error('Unable to parse AI response');
      }
}

function normalizeResponseData(data, defaultType = 'summary') {
      const validTypes = ['summary', 'debug'];
      if (!validTypes.includes(data.type)) {
            data.type = defaultType;
      }

      if (!Array.isArray(data.details?.actionItems)) {
            data.details = data.details || {};
            data.details.actionItems = [];
      }

      return {
            type: data.type,
            title: data.title || 'Untitled',
            summary: data.summary || '',
            language: data.language || 'en',
            content: data.content || '',
            details: {
                  topic: data.details?.topic || data.title || '',
                  actionItems: data.details?.actionItems || [],
                  question: data.details?.question || '',
                  answer: data.details?.answer || '',
                  bug: data.details?.bug || '',
                  fix: data.details?.fix || '',
                  code: data.details?.code || ''
            }
      };
}

async function transcribeAudio(base64Audio, mimeType, apiKey, userLanguage = 'en', settings = {}) {
      const outputLanguage = getOutputLanguage(userLanguage);
      const persona = getPersonaInstructions(settings);
      const languageInstr = getCommonLanguageInstructions(outputLanguage);
      const jsonStructure = getBaseJsonStructure(outputLanguage, userLanguage);

      const prompt = `
You are an expert multilingual audio transcription and analysis assistant.
Process the provided audio file and generate a structured analysis.

${persona}

${languageInstr}

Analyze the audio and determine:
1. What type of content this is: "summary" (meeting/lecture) or "debug" (technical discussion)
2. Create an appropriate title
3. Provide a comprehensive summary
4. Extract action items
5. Full transcription content

${jsonStructure}
`;

      const normalizedMimeType = mimeType.split(';')[0].trim();
      const text = await generateContent(apiKey, 'gemini-2.0-flash', [{
            parts: [
                  { inline_data: { mime_type: normalizedMimeType, data: base64Audio } },
                  { text: prompt }
            ]
      }]);

      const data = cleanAndParseJson(text);
      return normalizeResponseData(data, 'summary');
}

async function analyzeImage(base64Image, mimeType, apiKey, customPrompt = null, metadata = null, userLanguage = 'en', settings = {}) {
      let cropContext = "";
      if (metadata && metadata.width && metadata.height) {
            cropContext = `
IMPORTANT CONTEXT:
The user has intentionally selected a specific region of this image for you to analyze.
Selection Coordinates: X:${metadata.x}, Y:${metadata.y}, W:${metadata.width}, H:${metadata.height}
INSTRUCTION: Focus your analysis PRIMARILY on the content within this selected region.
`;
      }

      const outputLanguage = getOutputLanguage(userLanguage);
      const persona = getPersonaInstructions(settings);
      const languageInstr = getCommonLanguageInstructions(outputLanguage);
      const jsonStructure = getBaseJsonStructure(outputLanguage, userLanguage);

      const prompt = customPrompt || `
You are an expert image analysis assistant.
Analyze the provided image and generate a structured analysis.
${cropContext}

${persona}

${languageInstr}

Determine:
1. What type of content this is: "summary" (document/notes) or "debug" (error screenshot)
2. Create an appropriate title
3. Provide a comprehensive summary/description
4. Extract any text visible in the image
5. If it's code/error, identify the issue and suggest fixes

${jsonStructure}
`;

      const normalizedMimeType = mimeType.split(';')[0].trim();
      const text = await generateContent(apiKey, 'gemini-2.0-flash', [{
            parts: [
                  { inline_data: { mime_type: normalizedMimeType, data: base64Image } },
                  { text: prompt }
            ]
      }]);

      const data = cleanAndParseJson(text);
      return normalizeResponseData(data, 'summary');
}

async function chatWithSession(context, history, userMessage, apiKey, settings = {}) {
      const persona = getPersonaInstructions(settings);

      const systemPrompt = `
You are an AI assistant for a specific session.
You must answer the user's question ONLY based on the provided CONTEXT.
Do not hallucinate or use external knowledge unless it is common sense.
If the answer is not in the context, say so politely.

${persona}

CONTEXT:
Title: ${context.title}
Summary: ${context.summary}
Details: ${JSON.stringify(context.details)}
Full Content: ${context.content}
`;

      const contents = [
            { role: "model", parts: [{ text: systemPrompt }] },
            ...history.map(msg => ({
                  role: msg.role === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.content }]
            })),
            { role: "user", parts: [{ text: userMessage }] }
      ];

      const text = await generateContent(apiKey, 'gemini-2.0-flash', contents, {
            temperature: 0.7,
            maxOutputTokens: 1000
      });
      return text;
}

module.exports = {
      transcribeAudio,
      analyzeImage,
      chatWithSession,
      getMetrics
};
