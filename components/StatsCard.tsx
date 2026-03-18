import { AppStats } from '@/lib/types'
import Link from 'next/link'

interface StatsCardProps {
  stats: AppStats
}

export default function StatsCard({ stats }: StatsCardProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-400'
    if (rating >= 3) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <Link href={`/dashboard/app/${stats.app_slug}`}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-500 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">{stats.app_name}</h3>
            <p className="text-sm text-slate-400 mt-1">
              {stats.review_count} {stats.review_count === 1 ? 'review' : 'reviews'}
            </p>
          </div>
          <div className={`text-3xl font-bold ${getRatingColor(stats.avg_overall_rating)}`}>
            {stats.avg_overall_rating.toFixed(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-slate-400">Wallet</p>
            <p className="font-semibold text-white">{stats.avg_wallet_connection.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-400">UI/UX</p>
            <p className="font-semibold text-white">{stats.avg_ui_ux_quality.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-400">Function</p>
            <p className="font-semibold text-white">{stats.avg_core_functionality.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-400">Mobile</p>
            <p className="font-semibold text-white">{stats.avg_mobile_experience.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-400">Speed</p>
            <p className="font-semibold text-white">{stats.avg_speed_performance.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
