'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isRegistered = searchParams.get('registered') === 'true'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError } = await authClient.signIn.email({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message || 'Invalid email or password')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-8 shadow-2xl">
      <div className="mb-6">
        <Link href="/" className="text-xl font-black bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          TaskFlow
        </Link>
        <h1 className="text-2xl font-bold text-slate-100 mt-3">Welcome Back</h1>
        <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
      </div>

      {isRegistered && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3.5 rounded-xl mb-5 flex items-center gap-2">
          <span>✓</span>
          <span>Account created successfully! Please sign in with your credentials.</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3.5 rounded-xl mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
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
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-blue-500/20 mt-2"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="text-xs text-slate-400 text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/sign-up" className="text-blue-400 font-semibold hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
