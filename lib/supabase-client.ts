'use client'

import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check for missing environment variables
const missingVars: string[] = []
if (!supabaseUrl) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_URL')
}
if (!supabaseAnonKey) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Only throw error in browser runtime (when window is defined), not during build
// During build time, window is undefined, so we skip the error and use placeholder values
// This prevents build failures when env vars aren't available during static generation
if (typeof window !== 'undefined' && missingVars.length > 0) {
  throw new Error(
    `Missing Supabase environment variables: ${missingVars.join(', ')}. ` +
    `Please set these variables in your .env file. ` +
    `(This error only occurs in browser runtime, not during build)`
  )
}

// Create client with fallback values during build (won't be used)
export const supabaseClient = createBrowserClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

