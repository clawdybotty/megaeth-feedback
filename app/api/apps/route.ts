import { unstable_noStore as noStore } from 'next/cache'
import { getAllApps } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  noStore()
  
  try {
    const apps = getAllApps()
    return Response.json({ data: apps }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
    })
  } catch (error: any) {
    return Response.json({ error: error.message || 'Failed to fetch apps' }, { status: 500 })
  }
}
