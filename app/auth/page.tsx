'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    try {
      if (isSignUp) {
        // Sign up
        const { data, error: signUpError } = await supabaseClient.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          setError(signUpError.message)
          setIsLoading(false)
          return
        }

        if (data.user) {
          // Successfully signed up - AuthGuard will handle redirect
          router.refresh()
        }
      } else {
        // Sign in
        const { data, error: signInError } = await supabaseClient.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setIsLoading(false)
          return
        }

        if (data.user) {
          // Successfully signed in - AuthGuard will handle redirect
          router.refresh()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
          <h1 className="text-3xl font-bold text-black dark:text-zinc-50 mb-2">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            {isSignUp
              ? 'Create a new account to get started'
              : 'Sign in to your account to continue'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-black dark:text-zinc-50 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-black dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                placeholder="At least 6 characters"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Password must be at least 6 characters
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || password.length < 6}
              className="w-full px-4 py-2 bg-black dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setError(null)
                setPassword('')
              }}
              className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              {isSignUp ? (
                <>
                  Already have an account? <span className="font-medium">Sign in</span>
                </>
              ) : (
                <>
                  Don't have an account? <span className="font-medium">Sign up</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

