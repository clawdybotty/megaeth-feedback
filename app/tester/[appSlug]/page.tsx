"use client"

import { useState, useEffect, use, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import ReviewForm from '@/components/ReviewForm'
import { App, Review } from '@/lib/types'

function AppReviewContent({ params }: { params: Promise<{ appSlug: string }> }) {
  const { appSlug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [testerName, setTesterName] = useState('')
  const [telegramHandle, setTelegramHandle] = useState('')
  const [existingReview, setExistingReview] = useState<Review | undefined>()
  const [app, setApp] = useState<App | null>(null)
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    // Get user identity
    const name = localStorage.getItem('tester_name')
    const handle = searchParams.get('handle') || localStorage.getItem('telegram_handle')
    
    if (!name || !handle) {
      router.push('/')
      return
    }
    
    setTesterName(name)
    setTelegramHandle(handle)
    
    // Fetch app, apps list, and existing review
    Promise.all([
      fetch('/api/apps').then(res => res.json()),
      fetch(`/api/reviews?tester=${encodeURIComponent(handle)}`).then(res => res.json())
    ])
      .then(([appsData, reviewsData]) => {
        const allApps = appsData.data || []
        const currentApp = allApps.find((a: App) => a.slug === appSlug)
        setApp(currentApp || null)
        setApps(allApps)
        
        const reviews = reviewsData.data || []
        const existing = reviews.find((r: Review) => r.app_slug === appSlug)
        setExistingReview(existing)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load data:', err)
        setLoading(false)
      })
  }, [appSlug, router, searchParams])

  const handleSubmit = async (review: Omit<Review, 'id' | 'date_tested' | 'created_at'>) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      })

      const data = await response.json()

      if (response.ok) {
        setToast({ message: 'Review submitted successfully!', type: 'success' })
        
        // Find next unrated app
        const allReviews = await fetch(`/api/reviews?tester=${encodeURIComponent(telegramHandle)}`)
          .then(res => res.json())
          .then(data => data.data || [])
        
        const ratedSlugs = new Set(allReviews.map((r: Review) => r.app_slug))
        const nextApp = apps.find(a => !ratedSlugs.has(a.slug))
        
        if (nextApp) {
          setTimeout(() => {
            setToast({ 
              message: `Great! Next up: ${nextApp.name}`, 
              type: 'success' 
            })
            setTimeout(() => {
              router.push(`/tester/${nextApp.slug}?handle=${encodeURIComponent(telegramHandle)}`)
            }, 1500)
          }, 1000)
        } else {
          setTimeout(() => {
            router.push('/tester')
          }, 2000)
        }
      } else {
        setToast({ message: data.error || 'Failed to submit review', type: 'error' })
      }
    } catch (error) {
      setToast({ message: 'Network error. Please try again.', type: 'error' })
    }
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">App not found</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {toast && (
        <div 
          className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => router.push('/tester')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Apps
        </button>
      </div>

      <ReviewForm
        appSlug={app.slug}
        appName={app.name}
        testerName={testerName}
        telegramHandle={telegramHandle}
        existingReview={existingReview}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

export default function AppReviewPage({ params }: { params: Promise<{ appSlug: string }> }) {
  return (
    <Suspense fallback={<div className="text-center py-20"><p className="text-slate-400">Loading...</p></div>}>
      <AppReviewContent params={params} />
    </Suspense>
  )
}
