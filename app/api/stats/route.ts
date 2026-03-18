import { NextRequest, NextResponse } from 'next/server'
import { getStats } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const stats = getStats()
    return NextResponse.json({ data: stats })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
