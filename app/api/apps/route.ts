import { NextRequest, NextResponse } from 'next/server'
import { getAllApps } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const apps = getAllApps()
    return NextResponse.json({ data: apps })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch apps' },
      { status: 500 }
    )
  }
}
