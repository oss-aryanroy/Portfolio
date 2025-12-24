import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Lock, Loader2 } from 'lucide-react'
import BlogEditor from '../components/BlogEditor'

const API_URL = 'http://localhost:3001'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check for existing valid token on mount
  useEffect(() => {
    const token = sessionStorage.getItem('auth_token')
    if (token) {
      verifyToken(token)
    } else {
      setIsCheckingAuth(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        setIsAuthenticated(true)
      } else {
        sessionStorage.removeItem('auth_token')
      }
    } catch (err) {
      sessionStorage.removeItem('auth_token')
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
      })

      const data = await response.json()

      if (response.ok && data.token) {
        sessionStorage.setItem('auth_token', data.token)
        setIsAuthenticated(true)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (post) => {
    const token = sessionStorage.getItem('auth_token')

    try {
      const response = await fetch(`${API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(post)
      })

      if (response.ok) {
        alert('Post saved successfully!')
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to save post')
      }
    } catch (err) {
      alert('Failed to connect to server')
    }
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={48} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-32 px-6 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-8 rounded-2xl border border-purple-500/30 max-w-md w-full"
        >
          <div className="flex justify-center mb-6">
            <Lock size={48} className="text-purple-400" />
          </div>
          <h2 className="text-3xl font-bold text-center mb-6 gradient-text">Admin Access</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-3 bg-purple-900/20 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-500"
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-32 px-6 pb-24 max-w-7xl mx-auto min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-6xl font-bold text-center mb-16 gradient-text"
      >
        Create New Post
      </motion.h1>
      <BlogEditor onSave={handleSave} />
    </div>
  )
}