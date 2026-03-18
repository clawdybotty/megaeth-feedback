"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AppCard from '@/components/AppCard'
import { App, Review } from '@/lib/types'

export default function TesterPage() {
  const router = useRouter()
  const [testerName, setTesterName] = useState('')
  const [telegramHandle, setTelegramHandle] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user identified
    const name = localStorage.getItem('tester_name')
    const handle = localStorage.getItem('telegram_handle')
    
    if (!name || !handle) {
      router.push('/')
      return
    }
    
    setTesterName(name)
    setTelegramHandle(handle)
    
    // Fetch apps and user's reviews
    Promise.all([
      fetch('/api/apps').then(res => res.json()),
      fetch(`/api/reviews?tester=${encodeURIComponent(handle)}`).then(res => res.json())
    ])
      .then(([appsData, reviewsData]) => {
        setApps(appsData.data || [])
        setReviews(reviewsData.data || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [router])

  const isCompleted = (appSlug: string) => {
    return reviews.some(r => r.app_slug === appSlug)
  }

  const completedCount = reviews.length
  const totalCount = apps.length

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {testerName}!
        </h1>
        <p className="text-slate-300">
          Progress: {completedCount} / {totalCount} apps rated
        </p>
        <div className="mt-3 bg-slate-800 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-blue-600 h-full transition-all duration-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {apps.map(app => (
          <AppCard
            key={app.slug}
            app={app}
            isCompleted={isCompleted(app.slug)}
            telegramHandle={telegramHandle}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            localStorage.removeItem('tester_name')
            localStorage.removeItem('telegram_handle')
            router.push('/')
          }}
          className="text-slate-400 hover:text-white transition-colors text-sm"
        >
          Switch User
        </button>
      </div>
    </div>
  )
}
