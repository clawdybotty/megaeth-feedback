import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getAllApps } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    headers()
    const apps = getAllApps()
    return new Response(JSON.stringify({ data: apps }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}
