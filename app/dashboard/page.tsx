"use client"

import { useState, useEffect } from 'react'
import StatsCard from '@/components/StatsCard'
import { AppStats } from '@/lib/types'

export default function DashboardPage() {
  const [stats, setStats] = useState<AppStats[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'overall' | 'wallet' | 'reviews'>('overall')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load stats:', err)
        setLoading(false)
      })
  }, [])

  const handleExportCSV = () => {
    if (stats.length === 0) return

    const headers = [
      'App',
      'Reviews',
      'Overall',
      'Wallet',
      'UI/UX',
      'Functionality',
      'Mobile',
      'Speed'
    ]

    const rows = stats.map(s => [
      s.app_name,
      s.review_count,
      s.avg_overall_rating.toFixed(2),
      s.avg_wallet_connection.toFixed(2),
      s.avg_ui_ux_quality.toFixed(2),
      s.avg_core_functionality.toFixed(2),
      s.avg_mobile_experience.toFixed(2),
      s.avg_speed_performance.toFixed(2),
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

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
      case 'overall':
        aVal = a.avg_overall_rating
        bVal = b.avg_overall_rating
        break
      case 'wallet':
        aVal = a.avg_wallet_connection
        bVal = b.avg_wallet_connection
        break
      case 'reviews':
        aVal = a.review_count
        bVal = b.review_count
        break
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
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">No reviews yet. Start rating apps!</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-slate-300">
            Aggregated feedback from all testers
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
        <div className="flex gap-4 text-sm">
          <span className="text-slate-400">Sort by:</span>
          <button
            onClick={() => toggleSort('overall')}
            className={`${
              sortBy === 'overall' ? 'text-white font-semibold' : 'text-slate-400'
            } hover:text-white transition-colors`}
          >
            Overall {sortBy === 'overall' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('wallet')}
            className={`${
              sortBy === 'wallet' ? 'text-white font-semibold' : 'text-slate-400'
            } hover:text-white transition-colors`}
          >
            Wallet {sortBy === 'wallet' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => toggleSort('reviews')}
            className={`${
              sortBy === 'reviews' ? 'text-white font-semibold' : 'text-slate-400'
            } hover:text-white transition-colors`}
          >
            Reviews {sortBy === 'reviews' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
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
