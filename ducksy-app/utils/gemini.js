const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export async function transcribeAudio(base64Audio, mimeType, apiKey) {
      console.log(apiKey)

      if (!apiKey) {
            throw new Error('API Key is required')
      }

      const modelId = 'gemini-2.0-flash'

      const prompt = `
You are an expert audio transcription and analysis assistant.
Process the provided audio file and generate a structured analysis.

Analyze the audio and determine:
1. What type of content this is: "summary" (meeting/lecture), "chat" (Q&A/conversation), or "debug" (technical discussion/problem solving)
2. Create an appropriate title for this recording
3. Provide a comprehensive summary
4. Extract action items if it's a meeting/lecture
5. If it's a Q&A format, identify the main question and answer
6. If it's debugging/technical, identify the bug discussed and the solution
7. Full transcription content

Output Format: JSON object with this exact structure:
{
    "type": "summary" | "chat" | "debug",
    "title": "Clear descriptive title",
    "summary": "Comprehensive summary of the content",
    "language": according to the language received,
    "content": "Full transcription text here...",
    "details": {
        "topic": "Main topic discussed",
        "actionItems": ["Action item 1", "Action item 2"],
        "question": "Main question if Q&A format",
        "answer": "Main answer if Q&A format",
        "bug": "Bug description if debug type",
        "fix": "Solution description if debug type",
        "code": "Code snippet if any"
    }
}

Rules:
- "type" must be exactly one of: "summary", "chat", "debug"
- For "summary" type: focus on topic, summary, and actionItems
- For "chat" type: focus on question and answer
- For "debug" type: focus on bug, fix, and code
- "actionItems" should be an array (empty array [] if none)
- "language" should be ISO 639-1 code (e.g., "en", "th", "ja")
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

            const validTypes = ['summary', 'chat', 'debug']
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