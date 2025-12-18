'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabaseClient } from '@/lib/supabase-client'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const AUTH_ENABLED = true

  useEffect(() => {
    // Bypass auth check if disabled
    if (!AUTH_ENABLED) {
      setIsAuthenticated(true)
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession()

        if (!session) {
          setIsAuthenticated(false)
          setIsLoading(false)
          // Only redirect if not already on auth page
          if (pathname !== '/auth') {
            router.replace('/auth')
          }
          return
        }

        setIsAuthenticated(true)
        setIsLoading(false)
        // If authenticated and on auth page, redirect to home
        if (pathname === '/auth') {
          router.replace('/')
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsAuthenticated(false)
        setIsLoading(false)
        if (pathname !== '/auth') {
          router.replace('/auth')
        }
      }
    }

    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false)
        setIsLoading(false)
        if (pathname !== '/auth') {
          router.replace('/auth')
        }
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true)
        setIsLoading(false)
        // Redirect to home if on auth page
        if (pathname === '/auth') {
          router.replace('/')
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, pathname])

  // If on auth page, show it without sidebar/layout (but still check auth)
  if (pathname === '/auth') {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    )
  }

  // If not authenticated and auth is enabled, don't render children (redirect will happen)
  if (AUTH_ENABLED && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Redirecting to sign in...</div>
      </div>
    )
  }

  // User is authenticated (or auth is bypassed), show the app
  return <>{children}</>
}

