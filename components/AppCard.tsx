import Link from 'next/link'
import { App } from '@/lib/types'

interface AppCardProps {
  app: App
  isCompleted: boolean
  telegramHandle: string
}

export default function AppCard({ app, isCompleted, telegramHandle }: AppCardProps) {
  return (
    <Link 
      href={`/tester/${app.slug}?handle=${encodeURIComponent(telegramHandle)}`}
      className="block"
    >
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-500 transition-colors cursor-pointer">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">{app.name}</h3>
          <span className="text-2xl">
            {isCompleted ? '✅' : '⬜'}
          </span>
        </div>
        
        {app.knownIssues && (
          <div className="mt-3 bg-yellow-900/30 border border-yellow-700/50 rounded px-3 py-2">
            <p className="text-xs text-yellow-200">
              ⚠️ {app.knownIssues}
            </p>
          </div>
        )}
        
        <p className="text-sm text-slate-400 mt-3">
          {isCompleted ? 'Click to edit review' : 'Click to rate'}
        </p>
      </div>
    </Link>
  )
}
