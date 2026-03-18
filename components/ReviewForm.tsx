"use client"

import { useState } from 'react'
import StarRating from './StarRating'
import { Review } from '@/lib/types'

interface ReviewFormProps {
  appSlug: string
  appName: string
  testerName: string
  telegramHandle: string
  existingReview?: Review
  onSubmit: (review: Omit<Review, 'id' | 'date_tested' | 'created_at'>) => Promise<void>
}

export default function ReviewForm({
  appSlug,
  appName,
  testerName,
  telegramHandle,
  existingReview,
  onSubmit
}: ReviewFormProps) {
  const [walletConnection, setWalletConnection] = useState(existingReview?.wallet_connection || 0)
  const [uiUxQuality, setUiUxQuality] = useState(existingReview?.ui_ux_quality || 0)
  const [coreFunctionality, setCoreFunctionality] = useState(existingReview?.core_functionality || 0)
  const [mobileExperience, setMobileExperience] = useState(existingReview?.mobile_experience || 0)
  const [speedPerformance, setSpeedPerformance] = useState(existingReview?.speed_performance || 0)
  const [overallRating, setOverallRating] = useState(existingReview?.overall_rating || 0)
  const [needsAccessCode, setNeedsAccessCode] = useState(existingReview?.needs_access_code || false)
  const [bugsIssues, setBugsIssues] = useState(existingReview?.bugs_issues || '')
  const [generalComments, setGeneralComments] = useState(existingReview?.general_comments || '')
  const [showOptional, setShowOptional] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = 
    walletConnection > 0 &&
    uiUxQuality > 0 &&
    coreFunctionality > 0 &&
    mobileExperience > 0 &&
    speedPerformance > 0 &&
    overallRating > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        tester_name: testerName,
        telegram_handle: telegramHandle,
        app_slug: appSlug,
        wallet_connection: walletConnection,
        ui_ux_quality: uiUxQuality,
        core_functionality: coreFunctionality,
        mobile_experience: mobileExperience,
        speed_performance: speedPerformance,
        overall_rating: overallRating,
        needs_access_code: needsAccessCode,
        bugs_issues: bugsIssues || undefined,
        general_comments: generalComments || undefined,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Rate {appName}</h2>
        
        <div className="space-y-5">
          <StarRating
            label="Wallet Connection"
            value={walletConnection}
            onChange={setWalletConnection}
            required
          />
          
          <StarRating
            label="UI/UX Quality"
            value={uiUxQuality}
            onChange={setUiUxQuality}
            required
          />
          
          <StarRating
            label="Core Functionality"
            value={coreFunctionality}
            onChange={setCoreFunctionality}
            required
          />
          
          <StarRating
            label="Mobile Experience"
            value={mobileExperience}
            onChange={setMobileExperience}
            required
          />
          
          <StarRating
            label="Speed & Performance"
            value={speedPerformance}
            onChange={setSpeedPerformance}
            required
          />
          
          <div className="border-t border-slate-700 pt-5 mt-5">
            <StarRating
              label="Overall Rating"
              value={overallRating}
              onChange={setOverallRating}
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center gap-3 text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={needsAccessCode}
              onChange={(e) => setNeedsAccessCode(e.target.checked)}
              className="w-5 h-5 rounded bg-slate-700 border-slate-600"
            />
            <span>Needs access code to test</span>
          </label>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-lg">
        <button
          type="button"
          onClick={() => setShowOptional(!showOptional)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-750 transition-colors"
        >
          <span className="font-medium text-white">
            Bugs & Comments (Optional)
          </span>
          <span className="text-slate-400">
            {showOptional ? '▼' : '▶'}
          </span>
        </button>
        
        {showOptional && (
          <div className="px-6 pb-6 space-y-4 border-t border-slate-700">
            <div className="pt-4">
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Bugs or Issues
              </label>
              <textarea
                value={bugsIssues}
                onChange={(e) => setBugsIssues(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe any bugs or issues you encountered..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                General Comments
              </label>
              <textarea
                value={generalComments}
                onChange={(e) => setGeneralComments(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any other feedback..."
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors"
      >
        {isSubmitting ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
      </button>
    </form>
  )
}
