'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthModal from '@/components/AuthModal'
import { authClient } from '@/lib/auth-client'

interface UserProps {
  id: string
  name?: string | null
  email: string
}

export default function HeaderAuth({
  user,
  showButtonText = 'Sign In',
}: {
  user: UserProps | null
  showButtonText?: string
}) {
  const router = useRouter()
  const [isAuthOpen, setIsAuthOpen] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    router.refresh()
  }

  return (
    <>
      {user ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-300">
            Hi, {user.name || user.email.split('@')[0]}
          </span>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            LogOut
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAuthOpen(true)}
          className="px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 transition"
        >
          {showButtonText}
        </button>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}