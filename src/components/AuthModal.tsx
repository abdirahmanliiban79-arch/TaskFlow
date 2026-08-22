'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter()
  const [isSignUp, setIsSignUp] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleTabChange = (signUpMode: boolean) => {
    setIsSignUp(signUpMode)
    setError('')
    setSuccessMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    try {
      if (isSignUp) {
        if (password.length < 8) {
          setError('Password must be at least 8 characters long.')
          setLoading(false)
          return
        }

        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name,
        })

        if (signUpError) {
          setError(signUpError.message || 'Failed to create account')
          return
        }

        // With autoSignIn: false, the session is not created.
        // Prompt the user to manually sign in.
        setIsSignUp(false)
        setPassword('')
        setSuccessMessage('Account created successfully! Please sign in with your credentials.')
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message || 'Invalid email or password')
          return
        }

        onClose()
        router.refresh()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative text-slate-100 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition p-1 rounded-lg hover:bg-slate-800"
            type="button"
          >
            ✕
          </button>
        </div>

        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignUp ? 'Min. 8 characters' : 'Enter your password'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20 mt-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-slate-400 text-center mt-4">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => handleTabChange(!isSignUp)}
            className="text-blue-400 font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  )
}