import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 10

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const checkDb = searchParams.get('db') === '1'

  if (checkDb) {
    try {
      await prisma.$runCommandRaw({ ping: 1 })
    } catch (error) {
      console.error('Health check DB ping failed:', error)
      return NextResponse.json(
        { ok: false, db: 'unreachable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }

  return NextResponse.json(
    { ok: true, db: checkDb ? 'ok' : 'skipped', ts: Date.now() },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}