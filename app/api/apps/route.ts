import { NextRequest, NextResponse } from 'next/server'
import { getAllApps } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const apps = getAllApps()
    return NextResponse.json({ data: apps }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' }
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}
