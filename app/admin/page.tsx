'use client'

import { useState, useEffect } from 'react'
import { App } from '@/lib/types'

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(false)
  const [editingApp, setEditingApp] = useState<App | null>(null)
  const [newAppName, setNewAppName] = useState('')
  const [newAppSlug, setNewAppSlug] = useState('')
  const [newAppKnownIssues, setNewAppKnownIssues] = useState('')

  // Check if already authenticated on mount
  useEffect(() => {
    const authCreds = localStorage.getItem('adminAuth')
    if (authCreds) {
      setIsAuthenticated(true)
      fetchApps(authCreds)
    }
  }, [])

  const getAuthHeader = (creds?: string) => {
    const credentials = creds || localStorage.getItem('adminAuth')
    return credentials ? `Basic ${credentials}` : ''
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (data.authenticated) {
        const credentials = btoa(`${username}:${password}`)
        localStorage.setItem('adminAuth', credentials)
        setIsAuthenticated(true)
        fetchApps(credentials)
      } else {
        setLoginError('Invalid credentials')
      }
    } catch (error) {
      setLoginError('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuth')
    setIsAuthenticated(false)
    setApps([])
  }

  const fetchApps = async (creds?: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/apps', {
        headers: { Authorization: getAuthHeader(creds) },
      })

      if (response.ok) {
        const data = await response.json()
        setApps(data.data)
      } else if (response.status === 401) {
        handleLogout()
      }
    } catch (error) {
      console.error('Failed to fetch apps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAppName.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/admin/apps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          name: newAppName,
          slug: newAppSlug || undefined,
          knownIssues: newAppKnownIssues || undefined,
        }),
      })

      if (response.ok) {
        setNewAppName('')
        setNewAppSlug('')
        setNewAppKnownIssues('')
        fetchApps()
      } else {
        const data = await response.json()
        alert(`Failed to create app: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to create app')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateApp = async (app: App) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/apps/${app.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: getAuthHeader(),
        },
        body: JSON.stringify({
          name: app.name,
          knownIssues: app.knownIssues,
        }),
      })

      if (response.ok) {
        setEditingApp(null)
        fetchApps()
      } else {
        const data = await response.json()
        alert(`Failed to update app: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to update app')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteApp = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this app?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/apps/${slug}`, {
        method: 'DELETE',
        headers: { Authorization: getAuthHeader() },
      })

      if (response.ok) {
        fetchApps()
      } else {
        const data = await response.json()
        alert(`Failed to delete app: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to delete app')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="bg-slate-900 rounded-lg p-8 border border-slate-800">
          <h1 className="text-2xl font-bold text-white mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            {loginError && (
              <div className="text-red-400 text-sm">{loginError}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">App Management</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Add New App Form */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Add New App</h2>
        <form onSubmit={handleCreateApp} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                App Name *
              </label>
              <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="e.g., Uniswap"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Slug (optional, auto-generated)
              </label>
              <input
                type="text"
                value={newAppSlug}
                onChange={(e) => setNewAppSlug(e.target.value)}
                placeholder="e.g., uniswap"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Known Issues (optional)
            </label>
            <textarea
              value={newAppKnownIssues}
              onChange={(e) => setNewAppKnownIssues(e.target.value)}
              placeholder="e.g., Can't connect wallet on mobile"
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add App'}
          </button>
        </form>
      </div>

      {/* Apps List */}
      <div className="bg-slate-900 rounded-lg border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            Apps ({apps.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-800">
          {apps.map((app) => (
            <div key={app.id} className="p-6">
              {editingApp?.id === app.id && editingApp ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editingApp!.name}
                      onChange={(e) =>
                        setEditingApp({ ...editingApp!, name: e.target.value })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Known Issues
                    </label>
                    <textarea
                      value={editingApp!.knownIssues || ''}
                      onChange={(e) =>
                        setEditingApp({
                          ...editingApp!,
                          knownIssues: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateApp(editingApp!)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingApp(null)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {app.name}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Slug: <code className="text-slate-300">{app.slug}</code>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingApp(app)}
                        className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteApp(app.slug)}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {app.knownIssues && (
                    <div className="mt-2 p-3 bg-slate-800 rounded text-sm text-slate-300">
                      <strong className="text-yellow-400">Known Issues:</strong>{' '}
                      {app.knownIssues}
                    </div>
                  )}
                  {app.created_at && (
                    <p className="text-xs text-slate-500 mt-2">
                      Created: {new Date(app.created_at).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
          {apps.length === 0 && (
            <div className="p-6 text-center text-slate-400">No apps yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
