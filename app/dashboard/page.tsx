"use client"

import { useState, useEffect } from 'react'
import StatsCard from '@/components/StatsCard'
import { AppStats, Review, App } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<AppStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'overall' | 'wallet' | 'reviews'>('overall')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    // Fetch reviews and apps directly, compute stats client-side
    // This avoids all Next.js route handler caching issues
    Promise.all([
      fetch(`/api/reviews?_=${Date.now()}`).then(res => res.json()),
      fetch(`/api/apps?_=${Date.now()}`).then(res => res.json())
    ])
      .then(([reviewsData, appsData]) => {
        const reviews: Review[] = reviewsData.data || []
        const apps: App[] = appsData.data || []
        
        // Group reviews by app
        const appMap = new Map<string, Review[]>()
        for (const r of reviews) {
          if (!appMap.has(r.app_slug)) appMap.set(r.app_slug, [])
          appMap.get(r.app_slug)!.push(r)
        }
        
        // Compute stats per app
        const computed: AppStats[] = Array.from(appMap.entries()).map(([slug, appReviews]) => {
          const avg = (fn: (r: Review) => number) =>
            +(appReviews.reduce((s, r) => s + fn(r), 0) / appReviews.length).toFixed(2)
          const app = apps.find(a => a.slug === slug)
          return {
            app_slug: slug,
            app_name: app?.name || slug,
            review_count: appReviews.length,
            avg_wallet_connection: avg(r => r.wallet_connection),
            avg_ui_ux_quality: avg(r => r.ui_ux_quality),
            avg_core_functionality: avg(r => r.core_functionality),
            avg_mobile_experience: avg(r => r.mobile_experience),
            avg_speed_performance: avg(r => r.speed_performance),
            avg_overall_rating: avg(r => r.overall_rating),
          }
        })
        
        setStats(computed)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [])

  const handleExportCSV = () => {
    if (stats.length === 0) return

    const headers = ['App', 'Reviews', 'Overall', 'Wallet', 'UI/UX', 'Functionality', 'Mobile', 'Speed']
    const rows = stats.map(s => [
      s.app_name, s.review_count,
      s.avg_overall_rating.toFixed(2), s.avg_wallet_connection.toFixed(2),
      s.avg_ui_ux_quality.toFixed(2), s.avg_core_functionality.toFixed(2),
      s.avg_mobile_experience.toFixed(2), s.avg_speed_performance.toFixed(2),
    ])

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `megaeth-feedback-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const sortedStats = [...stats].sort((a, b) => {
    let aVal = 0, bVal = 0
    switch (sortBy) {
      case 'overall': aVal = a.avg_overall_rating; bVal = b.avg_overall_rating; break
      case 'wallet': aVal = a.avg_wallet_connection; bVal = b.avg_wallet_connection; break
      case 'reviews': aVal = a.review_count; bVal = b.review_count; break
    }
    return sortOrder === 'desc' ? bVal - aVal : aVal - bVal
  })

  const toggleSort = (field: 'overall' | 'wallet' | 'reviews') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return <div className="text-center py-20"><p className="text-slate-400">Loading...</p></div>
  }

  if (stats.length === 0) {
    return <div className="text-center py-20"><p className="text-slate-400">No reviews yet. Start rating apps!</p></div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-300">Aggregated feedback from all testers</p>
        </div>
        <button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
          Export CSV
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex gap-4 text-sm">
          <span className="text-slate-400">Sort by:</span>
          {(['overall', 'wallet', 'reviews'] as const).map(field => (
            <button key={field} onClick={() => toggleSort(field)}
              className={`${sortBy === field ? 'text-white font-semibold' : 'text-slate-400'} hover:text-white transition-colors`}>
              {field.charAt(0).toUpperCase() + field.slice(1)} {sortBy === field && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedStats.map(stat => (
          <StatsCard key={stat.app_slug} stats={stat} />
        ))}
      </div>
    </div>
  )
}
