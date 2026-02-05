const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

async function transcribeAudio(base64Audio, mimeType, apiKey, userLanguage = 'en', settings = {}) {
      if (!apiKey) {
            throw new Error('API Key is required')
      }

      const modelId = 'gemini-2.0-flash'

      const languageNames = {
            'en': 'English',
            'th': 'Thai',
            'zh': 'Chinese',
            'ja': 'Japanese'
      };

      const outputLanguage = languageNames[userLanguage] || 'English';

      const personality = settings.personality ?? 50;
      const responses = settings.responses ?? 50;

      let styleInstruction = "Tone: Professional and balanced.";
      if (personality < 30) styleInstruction = "Tone: Strict, formal, and objective.";
      else if (personality > 70) styleInstruction = "Tone: Creative, casual, and engaging.";

      let lengthInstruction = "Response Style: Standard detailed.";
      if (responses < 30) lengthInstruction = "Response Style: Extremely concise and to the point.";
      else if (responses > 70) lengthInstruction = "Response Style: Detailed, comprehensive, and verbose.";

      const prompt = `
You are an expert multilingual audio transcription and analysis assistant.
Process the provided audio file and generate a structured analysis.

PERSONA SETTINGS:
${styleInstruction}
${lengthInstruction}

CRITICAL INSTRUCTIONS:
1. The audio may be spoken in ANY language (English, Thai, Chinese, Japanese, or others)
2. You MUST understand and transcribe the audio regardless of what language it's in
3. You MUST translate and output ALL text content in ${outputLanguage} language
4. Even if the audio is in a different language, your entire output must be in ${outputLanguage}

Example: If audio is in English but app language is Thai, transcribe the English audio and output everything in Thai.
Example: If audio is in Japanese but app language is English, transcribe the Japanese audio and output everything in English.

Analyze the audio and determine:
1. What type of content this is: "summary" (meeting/lecture) or "debug" (technical discussion/problem solving)
2. Create an appropriate title for this recording (translate to ${outputLanguage})
3. Provide a comprehensive summary (translate to ${outputLanguage})
4. Extract action items if it's a meeting/lecture (translate to ${outputLanguage})
5. If it's debugging/technical, identify the bug discussed and the solution (translate to ${outputLanguage})
6. Full transcription content (translate to ${outputLanguage})

Output Format: JSON object with this exact structure:
{
    "type": "summary" | "debug",
    "title": "Clear descriptive title translated to ${outputLanguage}",
    "summary": "Comprehensive summary translated to ${outputLanguage}",
    "language": "${userLanguage}",
    "content": "Full transcription text translated to ${outputLanguage}...",
    "details": {
        "topic": "Main topic discussed translated to ${outputLanguage}",
        "actionItems": ["Action item 1 translated to ${outputLanguage}", "Action item 2 translated to ${outputLanguage}"],
        "bug": "Bug description if debug type translated to ${outputLanguage}",
        "fix": "Solution description if debug type translated to ${outputLanguage}",
        "code": "Code snippet if any (keep in original programming language)"
    }
}

Rules:
- "type" must be exactly one of: "summary", "debug"
- For "summary" type: focus on topic, summary, and actionItems
- For "debug" type: focus on bug, fix, and code
- "actionItems" should be an array (empty array [] if none)
- "language" must be "${userLanguage}"
- The audio input can be in ANY language - you must understand it and translate it
- ALL text fields (title, summary, content, topic, actionItems, bug, fix) MUST be translated to ${outputLanguage}
- Code snippets should remain in their original programming language (do not translate code)
- Technical terms can be kept in English if they don't have good translations
- Return ONLY the JSON object, no markdown code blocks
`

      let normalizedMimeType = mimeType
      if (mimeType.includes(';')) {
            normalizedMimeType = mimeType.split(';')[0].trim()
      }

      try {
            const response = await fetch(
                  `${GEMINI_API_URL}/${modelId}:generateContent?key=${apiKey}`,
                  {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                              contents: [
                                    {
                                          parts: [
                                                {
                                                      inline_data: {
                                                            mime_type: normalizedMimeType,
                                                            data: base64Audio,
                                                      },
                                                },
                                                {
                                                      text: prompt,
                                                },
                                          ],
                                    },
                              ],
                              generationConfig: {
                                    temperature: 0.1,
                                    topK: 32,
                                    topP: 1,
                                    maxOutputTokens: 8192,
                              },
                        }),
                  }
            )

            if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}))
                  const errorMessage = errorData.error?.message || `HTTP ${response.status}: Failed to transcribe audio`
                  throw new Error(errorMessage)
            }

            const result = await response.json()
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text

            if (!text) {
                  const blockReason = result.candidates?.[0]?.finishReason
                  if (blockReason && blockReason !== 'STOP') {
                        throw new Error(`Gemini blocked the response: ${blockReason}`)
                  }
                  throw new Error('No response from Gemini')
            }

            let cleanText = text.trim()
            cleanText = cleanText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim()

            let data
            try {
                  data = JSON.parse(cleanText)
            } catch (parseErr) {
                  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
                  if (jsonMatch) {
                        data = JSON.parse(jsonMatch[0])
                  } else {
                        throw new Error('ไม่สามารถแปลงผลลัพธ์จาก AI ได้ กรุณาลองใหม่อีกครั้ง')
                  }
            }

            const validTypes = ['summary', 'debug']
            if (!validTypes.includes(data.type)) {
                  data.type = 'summary'
            }

            if (!Array.isArray(data.details?.actionItems)) {
                  data.details = data.details || {}
                  data.details.actionItems = []
            }

            return {
                  type: data.type,
                  title: data.title || 'Untitled Recording',
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
            }
      } catch (error) {
            throw error
      }
}

async function analyzeImage(base64Image, mimeType, apiKey, customPrompt = null, metadata = null, userLanguage = 'en', settings = {}) {
      if (!apiKey) {
            throw new Error('API Key is required')
      }

      const modelId = 'gemini-2.0-flash'

      let cropContext = ""
      if (metadata && metadata.width && metadata.height) {
            cropContext = `
IMPORTANT CONTEXT:
The user has intentionally selected a specific region of this image for you to analyze.
Selection Coordinates:
- X: ${metadata.x}
- Y: ${metadata.y}
- Width: ${metadata.width}
- Height: ${metadata.height}

INSTRUCTION:
Focus your analysis PRIMARILY on the content within this selected region. Use the rest of the image only as context to better understand the selected area.
`
      }

      const personality = settings.personality ?? 50;
      const responses = settings.responses ?? 50;

      let styleInstruction = "Tone: Professional and balanced.";
      if (personality < 30) styleInstruction = "Tone: Strict, formal, and objective.";
      else if (personality > 70) styleInstruction = "Tone: Creative, casual, and engaging.";

      let lengthInstruction = "Response Style: Standard detailed.";
      if (responses < 30) lengthInstruction = "Response Style: Extremely concise and to the point.";
      else if (responses > 70) lengthInstruction = "Response Style: Detailed, comprehensive, and verbose.";

      const prompt = customPrompt || `
You are an expert image analysis assistant.
Analyze the provided image and generate a structured analysis.
            ${cropContext}

PERSONA SETTINGS:
${styleInstruction}
${lengthInstruction}


      Determine:
      1. What type of content this is: "summary"(document / notes / whiteboard) or "debug"(code / error screenshot)
      2. Create an appropriate title
      3. Provide a comprehensive summary / description
      4. Extract any text visible in the image
      5. If it's code/error, identify the issue and suggest fixes
      6. If it's a document, extract key points and action items

Output Format: JSON object with this exact structure:
      {
            "type": "summary" | "debug",
                  "title": "Clear descriptive title",
                        "summary": "Comprehensive description of the image content",
                              "language": "detected language of text in image",
                                    "content": "All extracted text from the image...",
                                          "details": {
                  "topic": "Main topic/subject of the image",
                        "actionItems": ["Action item 1", "Action item 2"],
                              "bug": "Bug/error description if code screenshot",
                                    "fix": "Suggested fix if code screenshot",
                                          "code": "Extracted code if present"
            }
      }

      Rules:
      - "type" must be exactly one of: "summary", "debug"
            - "actionItems" should be an array(empty array[] if none)
            - "language" should be ISO 639 - 1 code(e.g., "en", "th", "ja")
                  - Return ONLY the JSON object, no markdown code blocks
`

      let normalizedMimeType = mimeType
      if (mimeType.includes(';')) {
            normalizedMimeType = mimeType.split(';')[0].trim()
      }

      try {
            const response = await fetch(
                  `${GEMINI_API_URL}/${modelId}:generateContent?key=${apiKey}`,
                  {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                              contents: [
                                    {
                                          parts: [
                                                {
                                                      inline_data: {
                                                            mime_type: normalizedMimeType,
                                                            data: base64Image,
                                                      },
                                                },
                                                {
                                                      text: prompt,
                                                },
                                          ],
                                    },
                              ],
                              generationConfig: {
                                    temperature: 0.1,
                                    topK: 32,
                                    topP: 1,
                                    maxOutputTokens: 8192,
                              },
                        }),
                  }
            )

            if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}))
                  const errorMessage = errorData.error?.message || `HTTP ${response.status}: Failed to analyze image`
                  throw new Error(errorMessage)
            }

            const result = await response.json()
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text

            if (!text) {
                  const blockReason = result.candidates?.[0]?.finishReason
                  if (blockReason && blockReason !== 'STOP') {
                        throw new Error(`Gemini blocked the response: ${blockReason}`)
                  }
                  throw new Error('No response from Gemini')
            }

            let cleanText = text.trim()
            cleanText = cleanText.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?\s*```$/i, '').trim()

            let data
            try {
                  data = JSON.parse(cleanText)
            } catch (parseErr) {
                  const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
                  if (jsonMatch) {
                        data = JSON.parse(jsonMatch[0])
                  } else {
                        throw new Error('ไม่สามารถแปลงผลลัพธ์จาก AI ได้ กรุณาลองใหม่อีกครั้ง')
                  }
            }

            const validTypes = ['summary', 'debug']
            if (!validTypes.includes(data.type)) {
                  data.type = 'summary'
            }

            if (!Array.isArray(data.details?.actionItems)) {
                  data.details = data.details || {}
                  data.details.actionItems = []
            }

            return {
                  type: data.type,
                  title: data.title || 'Untitled Image',
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
            }
      } catch (error) {
            throw error
      }
}

async function chatWithSession(context, history, userMessage, apiKey, settings = {}) {
      if (!apiKey) {
            throw new Error('API Key is required')
      }

      const modelId = 'gemini-2.0-flash'
      const url = `${GEMINI_API_URL}/${modelId}:generateContent?key=${apiKey}`
      const personality = settings.personality ?? 50;
      const responses = settings.responses ?? 50;

      let styleInstruction = "Tone: Professional and balanced.";
      if (personality < 30) styleInstruction = "Tone: Strict, formal, and objective.";
      else if (personality > 70) styleInstruction = "Tone: Creative, casual, and engaging.";

      let lengthInstruction = "Response Style: Standard detailed.";
      if (responses < 30) lengthInstruction = "Response Style: Extremely concise and to the point.";
      else if (responses > 70) lengthInstruction = "Response Style: Detailed, comprehensive, and verbose.";

      const systemPrompt = `
      You are an AI assistant for a specific session.
      You must answer the user's question ONLY based on the provided CONTEXT.
      Do not hallucinate or use external knowledge unless it is common sense.
      If the answer is not in the context, say so politely.

      PERSONA SETTINGS:
      ${styleInstruction}
      ${lengthInstruction}

      CONTEXT:
      Title: ${context.title}
      Summary: ${context.summary}
      Details: ${JSON.stringify(context.details)}
      Full Content: ${context.content}
      `

      const contents = [
            {
                  role: "model",
                  parts: [{ text: systemPrompt }]
            },
            ...history.map(msg => ({
                  role: msg.role === 'user' ? 'user' : 'model',
                  parts: [{ text: msg.content }]
            })),
            {
                  role: "user",
                  parts: [{ text: userMessage }]
            }
      ]

      try {
            const response = await fetch(url, {
                  method: 'POST',
                  headers: {
                        'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                        contents: contents,
                        generationConfig: {
                              temperature: 0.7,
                              maxOutputTokens: 1000,
                        }
                  })
            })

            const data = await response.json()

            if (!response.ok) {
                  throw new Error(data.error?.message || 'Gemini API Error')
            }

            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (!text) {
                  throw new Error('No response from Gemini')
            }

            return text
      } catch (error) {
            console.error('Chat error:', error)
            throw error
      }
}

async function analyzeMedia(base64Data, mimeType, apiKey, customPrompt = null) {
      if (mimeType.startsWith('image/')) {
            return analyzeImage(base64Data, mimeType, apiKey, customPrompt)
      } else if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
            return transcribeAudio(base64Data, mimeType, apiKey)
      } else {
            throw new Error(`Unsupported media type: ${mimeType}`)
      }
}

module.exports = {
      transcribeAudio,
      analyzeImage,
      chatWithSession,
      analyzeMedia
}