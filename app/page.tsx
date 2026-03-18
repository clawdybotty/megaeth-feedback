"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')

  useEffect(() => {
    // Check if user already identified
    const savedName = localStorage.getItem('tester_name')
    const savedHandle = localStorage.getItem('telegram_handle')
    if (savedName && savedHandle) {
      router.push('/tester')
    }
  }, [router])

  const isValidHandle = (h: string) => /^[a-zA-Z0-9_]{3,32}$/.test(h)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedHandle = handle.trim().replace(/^@/, '')
    
    if (!trimmedName || !trimmedHandle) return
    
    if (!isValidHandle(trimmedHandle)) {
      alert('Telegram handle can only contain letters, numbers, and underscores (3-32 chars)')
      return
    }

    const formattedHandle = `@${trimmedHandle}`
    
    localStorage.setItem('tester_name', trimmedName)
    localStorage.setItem('telegram_handle', formattedHandle)
    
    router.push('/tester')
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome!</h1>
          <p className="text-slate-300 mb-8">
            Enter your details to start rating MegaETH apps
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-200 mb-2">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                required
              />
            </div>
            
            <div>
              <label htmlFor="handle" className="block text-sm font-medium text-slate-200 mb-2">
                Telegram Handle
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400">@</span>
                <input
                  type="text"
                  id="handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                  className="w-full pl-8 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username"
                  required
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Start Rating
            </button>
          </form>
        </div>
        
        <p className="text-center text-slate-400 text-sm mt-6">
          Your details are stored locally and used to track your reviews
        </p>
      </div>
    </div>
  )
}
