"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { App, Review } from '@/lib/types'
import Link from 'next/link'

export default function TesterDetailPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle: rawHandle } = use(params)
  const router = useRouter()
  const [apps, setApps] = useState<App[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const handle = decodeURIComponent(rawHandle)

  useEffect(() => {
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
  }, [handle])

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }

  const testerName = reviews[0]?.tester_name || handle
  const completionPercentage = apps.length > 0 ? ((reviews.length / apps.length) * 100).toFixed(0) : '0'
  const avgOverall = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.overall_rating, 0) / reviews.length).toFixed(1)
    : 'N/A'

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-slate-400 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{testerName}</h1>
        <p className="text-slate-300 mb-4">{handle}</p>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{reviews.length}</p>
            <p className="text-sm text-slate-400">Reviews</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-400">{completionPercentage}%</p>
            <p className="text-sm text-slate-400">Completion</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">{avgOverall}</p>
            <p className="text-sm text-slate-400">Avg Rating</p>
          </div>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-slate-400">No reviews yet from this tester</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const app = apps.find(a => a.slug === review.app_slug)
            return (
              <div
                key={review.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Link
                      href={`/dashboard/app/${review.app_slug}`}
                      className="text-xl font-semibold text-white hover:text-blue-400 transition-colors"
                    >
                      {app?.name || review.app_slug}
                    </Link>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(review.created_at || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {review.overall_rating}★
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4 text-sm">
                  <div>
                    <p className="text-slate-400">Wallet</p>
                    <p className="font-semibold text-white">{review.wallet_connection}★</p>
                  </div>
                  <div>
                    <p className="text-slate-400">UI/UX</p>
                    <p className="font-semibold text-white">{review.ui_ux_quality}★</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Functionality</p>
                    <p className="font-semibold text-white">{review.core_functionality}★</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Mobile</p>
                    <p className="font-semibold text-white">{review.mobile_experience}★</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Speed</p>
                    <p className="font-semibold text-white">{review.speed_performance}★</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Access Code</p>
                    <p className="font-semibold text-white">
                      {review.needs_access_code ? 'Required' : 'Not needed'}
                    </p>
                  </div>
                </div>

                {review.bugs_issues && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-red-300 mb-1">Bugs/Issues:</p>
                    <p className="text-sm text-slate-300 bg-slate-900 rounded p-3">
                      {review.bugs_issues}
                    </p>
                  </div>
                )}

                {review.general_comments && (
                  <div>
                    <p className="text-sm font-medium text-slate-300 mb-1">Comments:</p>
                    <p className="text-sm text-slate-300 bg-slate-900 rounded p-3">
                      {review.general_comments}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
