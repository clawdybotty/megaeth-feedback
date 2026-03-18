import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStats } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET() {
  try {
    headers()
    const stats = getStats()
    const { getAllReviews } = require('@/lib/db')
    const allReviews = getAllReviews()
    console.log(`[stats] reviews count: ${allReviews.length}, stats count: ${stats.length}`)
    if (stats.length === 0 && allReviews.length > 0) {
      // Fallback: compute stats from reviews directly
      const appMap = new Map<string, any[]>()
      for (const r of allReviews) {
        if (!appMap.has(r.app_slug)) appMap.set(r.app_slug, [])
        appMap.get(r.app_slug)!.push(r)
      }
      const fallbackStats = Array.from(appMap.entries()).map(([slug, reviews]) => {
        const avg = (field: string) => +(reviews.reduce((s: number, r: any) => s + r[field], 0) / reviews.length).toFixed(2)
        return {
          app_slug: slug,
          app_name: slug,
          review_count: reviews.length,
          avg_wallet_connection: avg('wallet_connection'),
          avg_ui_ux_quality: avg('ui_ux_quality'),
          avg_core_functionality: avg('core_functionality'),
          avg_mobile_experience: avg('mobile_experience'),
          avg_speed_performance: avg('speed_performance'),
          avg_overall_rating: avg('overall_rating'),
        }
      })
      return new Response(JSON.stringify({ data: fallbackStats }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        }
      })
    }
    return new Response(JSON.stringify({ data: stats }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
