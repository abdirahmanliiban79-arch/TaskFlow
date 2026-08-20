import { GoogleGenAI } from '@google/genai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      console.error('GEMINI_API_KEY is missing in environment variables.')
      return NextResponse.json({ error: 'API key missing' }, { status: 500 })
    }

    const ai = new GoogleGenAI({ apiKey })

 
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: message,
    })

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error('Gemini API Error details:', error)
    return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 })
  }
}