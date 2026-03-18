"use client"

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  label?: string
  required?: boolean
}

export default function StarRating({ value, onChange, label, required }: StarRatingProps) {
  const [hover, setHover] = useState(0)

  const getEmoji = (rating: number) => {
    if (rating === 0) return '⭐'
    if (rating === 1) return '😕'
    if (rating === 2) return '😐'
    if (rating === 3) return '🙂'
    if (rating === 4) return '😊'
    return '🤩'
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-200">
          {label}
          {required && value === 0 && (
            <span className="text-red-400 ml-1">*</span>
          )}
        </label>
      )}
      <div className="flex items-center gap-4">
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${
                star <= (hover || value)
                  ? 'text-yellow-400'
                  : 'text-slate-600'
              }`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              aria-label={`Rate ${star} stars`}
            >
              ★
            </button>
          ))}
        </div>
        <span className="text-2xl" role="img" aria-label="Rating emoji">
          {getEmoji(hover || value)}
        </span>
      </div>
    </div>
  )
}
