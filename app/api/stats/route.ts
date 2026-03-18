import { unstable_noStore as noStore } from 'next/cache'
import { getStats, getAllReviews } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  noStore()
  
  try {
    const stats = getStats()
    
    // Fallback: compute from reviews if GROUP BY returns empty
    if (stats.length === 0) {
      const allReviews = getAllReviews()
      if (allReviews.length > 0) {
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
        return Response.json({ data: fallbackStats }, {
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
        })
      }
    }
    
    return Response.json({ data: stats }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' }
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
