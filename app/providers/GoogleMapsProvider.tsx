'use client'

import { ReactNode } from 'react'
import { LoadScript } from '@react-google-maps/api'

interface GoogleMapsProviderProps {
  children: ReactNode
}

// Set up global console.error filter to suppress "google api is already presented" error
// This runs immediately when the module loads, before any components render
if (typeof window !== 'undefined' && !(window as any).__googleMapsErrorFiltered) {
  const originalError = console.error
  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || ''
    // Filter out the "google api is already presented" error
    if (message.includes('google api is already presented')) {
      return // Don't log this error
    }
    // Log all other errors normally
    originalError.apply(console, args)
  }
  ;(window as any).__googleMapsErrorFiltered = true
}

// Check if Google Maps script is already loaded
function isGoogleMapsLoaded(): boolean {
  if (typeof window === 'undefined') return false
  // Check if Google Maps API is available
  if (window.google?.maps?.Map) return true
  // Check if script tag with Google Maps URL exists
  const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
  return scripts.length > 0
}

export function GoogleMapsProvider({ children }: GoogleMapsProviderProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // If no API key, render children without LoadScript
  if (!apiKey) {
    return <>{children}</>
  }

  // Check synchronously if script is already loaded before rendering LoadScript
  // This prevents LoadScript from trying to load an already-loaded script
  const scriptAlreadyLoaded = typeof window !== 'undefined' && isGoogleMapsLoaded()

  // If script is already loaded, just render children
  // The Google Maps API is already available globally
  if (scriptAlreadyLoaded) {
    return <>{children}</>
  }

  // Only use LoadScript if script is not already loaded
  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={['places']}
      loadingElement={<div>Loading...</div>}
      onError={(error: Error | string) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || ''
        // If script is already loaded, silently ignore
        if (
          errorMessage.includes('already presented') ||
          errorMessage.includes('already loaded')
        ) {
          return
        }
        // Only log actual errors
        console.error('Error loading Google Maps API:', error)
      }}
    >
      {children}
    </LoadScript>
  )
}

