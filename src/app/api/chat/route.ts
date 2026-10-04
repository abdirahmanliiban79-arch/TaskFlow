import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export const maxDuration = 60

const MAX_MESSAGE_LENGTH = 2000
const AI_TIMEOUT_MS = 50_000

export async function POST(req: Request) {
  let message: unknown

  try {
    const body = await req.json()
    message = body?.message
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 413 })
  }

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing in environment variables.')
    return NextResponse.json({ error: 'API key missing' }, { status: 500 })
  }

  const ai = new GoogleGenAI({ apiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
      config: {
        abortSignal: AbortSignal.timeout(AI_TIMEOUT_MS),
      },
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    const isTimeout =
      error instanceof Error &&
      (error.name === 'TimeoutError' || error.name === 'AbortError')

    console.error('Gemini API Error details:', error)

    return NextResponse.json(
      { error: isTimeout ? 'AI request timed out' : 'Failed to generate AI response' },
      { status: isTimeout ? 504 : 502 }
    )
  }
}